#!/usr/bin/env node
/**
 * Garde-fou du catalogue de styles.
 *
 * Vérifie que chaque direction artistique atteint le niveau WCAG AA sur toutes les
 * paires texte/fond, en mode clair ET en mode sombre. Une direction qui échoue
 * n'entre pas dans le catalogue et ne peut pas être appliquée à un site.
 *
 * Ce script n'a aucune dépendance et bloque la CI en cas d'échec.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ratio } from "./contrast.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOGUE = join(ROOT, "theme", "catalogue");

// Seuils WCAG 2.1 : 4.5:1 pour le texte courant, 3:1 pour les éléments d'interface.
const PAIRS = [
  ["text", "bg", 4.5, "texte principal sur le fond de page"],
  ["text", "surface", 4.5, "texte principal sur une carte"],
  ["text", "surfaceAlt", 4.5, "texte principal sur un fond secondaire"],
  ["textMuted", "bg", 4.5, "texte secondaire sur le fond de page"],
  ["textMuted", "surface", 4.5, "texte secondaire sur une carte"],
  ["accent", "bg", 4.5, "lien / action sur le fond de page"],
  ["accent", "surface", 4.5, "lien / action sur une carte"],
  ["onAccent", "accent", 4.5, "texte d'un bouton plein"],
  ["ok", "surface", 4.5, "état « validé »"],
  ["warn", "surface", 4.5, "état « attention »"],
  ["danger", "surface", 4.5, "état « erreur »"],
  // WCAG 1.4.11 : les limites des composants d'interface (champs, boutons, focus)
  // exigent 3:1. Les filets purement décoratifs en sont exemptés — d'où deux jetons.
  ["borderStrong", "bg", 3.0, "contour d'un champ de saisie sur le fond de page"],
  ["borderStrong", "surface", 3.0, "contour d'un champ de saisie sur une carte"],
];

// Contrôles indicatifs : signalés, jamais bloquants.
const ADVISORY = [
  ["border", "bg", 1.25, "filet décoratif visible sur le fond de page"],
];

function checkTheme(theme, file) {
  const problems = [];
  const notices = [];
  for (const mode of ["light", "dark"]) {
    const palette = theme.color?.[mode];
    if (!palette) {
      problems.push({ mode, label: "palette absente", got: 0, min: 0 });
      continue;
    }
    for (const [fg, bg, min, label] of PAIRS) {
      if (!palette[fg] || !palette[bg]) {
        problems.push({ mode, label: `jeton manquant : ${fg} ou ${bg}`, got: 0, min });
        continue;
      }
      const got = ratio(palette[fg], palette[bg]);
      if (got < min) {
        problems.push({ mode, label, pair: `${fg} / ${bg}`, got, min, fg: palette[fg], bg: palette[bg] });
      }
    }
    for (const [fg, bg, min, label] of ADVISORY) {
      if (!palette[fg] || !palette[bg]) continue;
      const got = ratio(palette[fg], palette[bg]);
      if (got < min) notices.push({ mode, label, pair: `${fg} / ${bg}`, got, min });
    }
  }
  return { problems, notices };
}

const files = readdirSync(CATALOGUE).filter((f) => f.endsWith(".json")).sort();
if (files.length === 0) {
  console.error("Aucune direction artistique trouvée dans theme/catalogue/.");
  process.exit(1);
}

let failed = 0;
console.log(`\nContrôle d'accessibilité du catalogue — ${files.length} direction(s)\n`);

for (const file of files) {
  const theme = JSON.parse(readFileSync(join(CATALOGUE, file), "utf8"));
  const { problems, notices } = checkTheme(theme, file);
  if (problems.length === 0) {
    console.log(`  OK    ${theme.label.padEnd(22)} ${file}`);
    for (const n of notices) {
      console.log(`        note  [${n.mode}] ${n.pair} : ${n.got}:1 — ${n.label}`);
    }
  } else {
    failed++;
    console.log(`  ECHEC ${theme.label.padEnd(22)} ${file}`);
    for (const p of problems) {
      const detail = p.pair ? `${p.pair} — ${p.fg} sur ${p.bg}` : p.label;
      console.log(`        [${p.mode}] ${detail} : ${p.got}:1, minimum ${p.min}:1  (${p.label})`);
    }
  }
}

console.log("");
if (failed > 0) {
  console.error(
    `${failed} direction(s) refusée(s). Corrige les couleurs concernées : une direction qui\n` +
    `n'atteint pas AA ne peut pas être livrée à un client.\n`
  );
  process.exit(1);
}
console.log("Toutes les directions artistiques atteignent WCAG AA en clair et en sombre.\n");
