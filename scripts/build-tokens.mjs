#!/usr/bin/env node
/**
 * Compile la direction artistique active en variables CSS.
 *
 * Lit theme/active.json (qui pointe vers une direction du catalogue), produit
 * app/tokens.generated.css et lib/theme.generated.ts. Aucun composant ne connaît
 * jamais une couleur en dur : ils ne lisent que ces variables.
 *
 * Changer de style = changer une ligne dans theme/active.json.
 *
 * Convention de nommage : les variables générées sont préfixées (--c-, --f-, --fs-,
 * --sp-, --rad-, --sh-) pour ne jamais entrer en collision avec les variables du
 * thème Tailwind. Le pont entre les deux se fait dans app/globals.css, bloc @theme.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ACTIVE = join(ROOT, "theme", "active.json");

// La densité pilote l'unité d'espacement de Tailwind : toutes les utilitaires
// p-4, gap-6, py-16 respirent ou se resserrent d'un seul coup.
const DENSITY = { compact: "0.2125rem", normal: "0.25rem", comfortable: "0.2875rem" };

const SHADOW = {
  none: { sm: "none", md: "none", lg: "none" },
  subtle: {
    sm: "0 1px 1px color-mix(in srgb, var(--c-text) 6%, transparent)",
    md: "0 1px 2px color-mix(in srgb, var(--c-text) 6%, transparent), 0 6px 16px -10px color-mix(in srgb, var(--c-text) 22%, transparent)",
    lg: "0 2px 4px color-mix(in srgb, var(--c-text) 6%, transparent), 0 16px 36px -18px color-mix(in srgb, var(--c-text) 30%, transparent)",
  },
  soft: {
    sm: "0 1px 2px color-mix(in srgb, var(--c-text) 8%, transparent)",
    md: "0 2px 6px color-mix(in srgb, var(--c-text) 9%, transparent), 0 10px 26px -12px color-mix(in srgb, var(--c-text) 28%, transparent)",
    lg: "0 4px 10px color-mix(in srgb, var(--c-text) 10%, transparent), 0 24px 50px -20px color-mix(in srgb, var(--c-text) 34%, transparent)",
  },
  lifted: {
    sm: "2px 2px 0 var(--c-border-strong)",
    md: "4px 4px 0 var(--c-border-strong)",
    lg: "7px 7px 0 var(--c-border-strong)",
  },
};

function readActive() {
  if (!existsSync(ACTIVE)) {
    throw new Error(
      'theme/active.json est absent. Crée-le avec { "direction": "suisse" } ' +
        "ou exécute `npm run theme:list` pour voir le catalogue.",
    );
  }
  const { direction, overrides } = JSON.parse(readFileSync(ACTIVE, "utf8"));
  const file = join(ROOT, "theme", "catalogue", `${direction}.json`);
  if (!existsSync(file)) {
    throw new Error(`Direction artistique inconnue : « ${direction} ». Voir theme/catalogue/.`);
  }
  const theme = JSON.parse(readFileSync(file, "utf8"));
  if (overrides?.color) {
    for (const mode of ["light", "dark"]) {
      Object.assign(theme.color[mode], overrides.color[mode] ?? {});
    }
  }
  return theme;
}

const KEBAB = {
  bg: "bg",
  surface: "surface",
  surfaceAlt: "surface-alt",
  text: "text",
  textMuted: "text-muted",
  border: "border",
  borderStrong: "border-strong",
  accent: "accent",
  onAccent: "on-accent",
  ok: "ok",
  warn: "warn",
  danger: "danger",
};

function paletteVars(palette, indent = "  ") {
  return Object.entries(palette)
    .map(([k, v]) => `${indent}--c-${KEBAB[k] ?? k}: ${v};`)
    .join("\n");
}

function typeScale(theme) {
  const r = theme.typography.scale ?? 1.25;
  const steps = { xs: -2, sm: -1, base: 0, lg: 1, xl: 2, "2xl": 3, "3xl": 4, "4xl": 5 };
  return Object.entries(steps)
    .map(([name, n]) => `  --fs-${name}: ${Math.pow(r, n).toFixed(4)}rem;`)
    .join("\n");
}

function googleFontsHref(theme) {
  const families = [];
  for (const role of ["display", "body", "mono"]) {
    const f = theme.typography[role];
    if (!f?.googleFont || !f.family) continue;
    const weights = [...new Set(f.weights ?? [400])].sort((a, b) => a - b);
    families.push(`family=${f.family.replace(/ /g, "+")}:wght@${weights.join(";")}`);
  }
  if (families.length === 0) return null;
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}

const theme = readActive();
const shadows = SHADOW[theme.shape?.shadow ?? "subtle"];

const css = `/* ------------------------------------------------------------------
 * FICHIER GÉNÉRÉ — ne pas modifier à la main.
 * Source : theme/active.json -> theme/catalogue/${theme.name}.json
 * Régénérer : npm run theme:build
 * ------------------------------------------------------------------ */

:root {
  color-scheme: light dark;

  /* Palette — mode clair */
${paletteVars(theme.color.light)}

  /* Typographie */
  --f-display: ${theme.typography.display.stack};
  --f-body: ${theme.typography.body.stack};
  --f-mono: ${theme.typography.mono?.stack ?? "ui-monospace, monospace"};
  --f-root-size: ${theme.typography.baseSize ?? "16px"};
  --f-display-weight: ${theme.typography.displayWeight ?? 700};
  --f-display-tracking: ${theme.typography.displayTracking ?? "-0.02em"};
${typeScale(theme)}

  /* Formes */
  --rad: ${theme.shape?.radius ?? "6px"};
  --rad-lg: ${theme.shape?.radiusLg ?? "12px"};
  --bw: ${theme.shape?.border ?? "1px"};

  /* Unité d'espacement, pilotée par la densité « ${theme.shape?.density ?? "normal"} » */
  --sp-unit: ${DENSITY[theme.shape?.density ?? "normal"]};

  /* Ombres */
  --sh-sm: ${shadows.sm};
  --sh-md: ${shadows.md};
  --sh-lg: ${shadows.lg};
}

/* Mode sombre par préférence système, sauf choix explicite du visiteur. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${paletteVars(theme.color.dark, "    ")}
  }
}

/* Mode sombre par choix explicite du visiteur. */
:root[data-theme="dark"] {
${paletteVars(theme.color.dark, "  ")}
}
`;

writeFileSync(join(ROOT, "app", "tokens.generated.css"), css);

const ts = `// FICHIER GÉNÉRÉ — ne pas modifier à la main. Régénérer : npm run theme:build
export const activeTheme = {
  name: ${JSON.stringify(theme.name)},
  label: ${JSON.stringify(theme.label)},
  description: ${JSON.stringify(theme.description ?? "")},
  usage: ${JSON.stringify(theme.usage ?? "")},
  googleFontsHref: ${JSON.stringify(googleFontsHref(theme))},
} as const;
`;
writeFileSync(join(ROOT, "lib", "theme.generated.ts"), ts);

console.log(`Direction artistique compilée : ${theme.label} (${theme.name})`);
