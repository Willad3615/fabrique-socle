import { test, expect } from "@playwright/test";

/**
 * Régression visuelle.
 *
 * À la première exécution, Playwright enregistre une image de référence par
 * combinaison (page × largeur × thème) dans tests/e2e/apparence.spec.ts-snapshots/.
 * Ces références sont versionnées dans le dépôt : à chaque pull request suivante,
 * toute différence de pixels au-delà du seuil fait échouer le test et produit une
 * image de comparaison à trois volets (attendu / obtenu / différence).
 *
 * C'est le filet qui attrape ce qu'aucune règle ne décrit : une marge qui saute,
 * un bouton qui déborde, une police qui ne charge plus, un thème qui casse en
 * mode sombre. Quand la différence est voulue, on régénère les références avec
 * `npx playwright test --update-snapshots` et le diff apparaît dans la PR.
 */

const PAGES = [
  { chemin: "/", nom: "accueil" },
  // Ajouter ici chaque page du brief. Une page sans référence visuelle
  // est une page dont personne ne verra la régression.
];

const LARGEURS = [
  { nom: "mobile", width: 390, height: 844 },
  { nom: "tablette", width: 768, height: 1024 },
  { nom: "bureau", width: 1440, height: 900 },
];

for (const page of PAGES) {
  for (const vue of LARGEURS) {
    for (const theme of ["light", "dark"] as const) {
      test(`apparence — ${page.nom} · ${vue.nom} · ${theme}`, async ({ browser }) => {
        const ctx = await browser.newContext({
          viewport: { width: vue.width, height: vue.height },
          colorScheme: theme,
          locale: "fr-FR",
          reducedMotion: "reduce",
        });
        const p = await ctx.newPage();
        await p.goto(page.chemin, { waitUntil: "networkidle" });

        // Les polices distantes arrivent après le premier rendu : sans cette
        // attente, la référence est capturée avec la police de repli et chaque
        // exécution suivante échoue pour une mauvaise raison.
        await p.evaluate(() => document.fonts.ready);

        await expect(p).toHaveScreenshot(`${page.nom}-${vue.nom}-${theme}.png`, {
          fullPage: true,
          animations: "disabled",
          // Tolérance : 1,5 % des pixels. Assez pour absorber le rendu des polices
          // d'un runner à l'autre, trop peu pour laisser passer un décalage de mise en page.
          maxDiffPixelRatio: 0.015,
        });

        await ctx.close();
      });
    }
  }
}
