#!/usr/bin/env node
/**
 * QA visuelle d'un site déployé.
 *
 *   node scripts/qa-visuelle.mjs https://mon-site.vercel.app qa-visuelle
 *
 * Capture chaque page du brief à trois largeurs, en clair et en sombre, lance
 * axe-core sur la page rendue, et écrit un rapport JSON à côté des images.
 *
 * S'exécute là où le navigateur peut réellement atteindre le site : sur un
 * runner GitHub Actions, ou en local. Les images produites sont lisibles par un
 * agent via l'API GitHub une fois publiées en artefact — c'est ce qui permet à
 * Claude de *regarder* le résultat au lieu de le déduire du code.
 */
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [, , base, dossier = "qa-visuelle"] = process.argv;
if (!base) {
  console.error("Usage : node scripts/qa-visuelle.mjs <url> [dossier]");
  process.exit(1);
}

// Ajouter ici chaque page du brief. Une page absente de cette liste
// n'est regardée par personne.
const PAGES = [{ chemin: "/", nom: "accueil" }];

const LARGEURS = [
  { nom: "mobile", width: 390, height: 844 },
  { nom: "tablette", width: 768, height: 1024 },
  { nom: "bureau", width: 1440, height: 900 },
];

mkdirSync(dossier, { recursive: true });

const navigateur = await chromium.launch();
const rapport = { url: base, captures: [], accessibilite: { violations: [] }, fondOpaque: true, h1Unique: true };

for (const page of PAGES) {
  for (const vue of LARGEURS) {
    for (const theme of ["light", "dark"]) {
      const ctx = await navigateur.newContext({
        viewport: { width: vue.width, height: vue.height },
        colorScheme: theme,
        locale: "fr-FR",
        reducedMotion: "reduce",
      });
      const p = await ctx.newPage();
      await p.goto(new URL(page.chemin, base).href, { waitUntil: "networkidle", timeout: 60000 });
      await p.evaluate(() => document.fonts.ready);

      const fichier = `${page.nom}-${vue.nom}-${theme}.png`;
      await p.screenshot({ path: join(dossier, fichier), fullPage: true, animations: "disabled" });
      rapport.captures.push({ page: page.nom, largeur: vue.width, theme, fichier });

      // Deux contrôles qu'aucune capture ne révèle d'elle-même.
      // Un fond transparent est le bug classique du mode sombre : la page
      // emprunte le fond de son hôte et affiche le texte d'un thème sur l'autre.
      const fond = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
      if (fond === "rgba(0, 0, 0, 0)" || fond === "transparent") rapport.fondOpaque = false;
      if ((await p.locator("h1").count()) !== 1) rapport.h1Unique = false;

      // L'audit d'accessibilité une seule fois par page, sur la vue bureau en clair :
      // le rejouer six fois produit six fois les mêmes violations.
      if (vue.nom === "bureau" && theme === "light") {
        const { violations } = await new AxeBuilder({ page: p })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        for (const v of violations) {
          rapport.accessibilite.violations.push({
            page: page.nom,
            regle: v.id,
            impact: v.impact,
            description: v.help,
            elements: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
          });
        }
      }

      await ctx.close();
    }
  }
}

await navigateur.close();
writeFileSync(join(dossier, "rapport.json"), JSON.stringify(rapport, null, 2));

console.log(`${rapport.captures.length} captures écrites dans ${dossier}/`);
console.log(`Violations d'accessibilité : ${rapport.accessibilite.violations.length}`);
if (!rapport.fondOpaque) console.log("ATTENTION : le fond de page n'est pas opaque.");
if (!rapport.h1Unique) console.log("ATTENTION : la page n'a pas exactement un titre h1.");
