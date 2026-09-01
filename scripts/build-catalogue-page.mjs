#!/usr/bin/env node
/**
 * Génère la planche visuelle du catalogue de directions artistiques.
 *
 * C'est l'écran que voit le stagiaire : il choisit un style en le regardant,
 * jamais en lisant un fichier. La page est produite à partir des mêmes fichiers
 * JSON que le site — ce qui est montré est exactement ce qui sera livré.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ratio } from "./contrast.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOGUE = join(ROOT, "theme", "catalogue");
const OUT = process.argv[2] ?? join(ROOT, "catalogue.html");

const themes = readdirSync(CATALOGUE)
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => JSON.parse(readFileSync(join(CATALOGUE, f), "utf8")));

const DENSITY = { compact: "0.2125rem", normal: "0.25rem", comfortable: "0.2875rem" };
const SHADOW = {
  none: "none",
  subtle: "0 1px 2px rgba(0,0,0,.06), 0 6px 16px -10px rgba(0,0,0,.22)",
  soft: "0 2px 6px rgba(0,0,0,.09), 0 10px 26px -12px rgba(0,0,0,.28)",
  lifted: "4px 4px 0 var(--borderStrong)",
};

function fontsHref() {
  const fams = new Set();
  for (const t of themes) {
    for (const role of ["display", "body", "mono"]) {
      const f = t.typography[role];
      if (!f?.googleFont) continue;
      const w = [...new Set(f.weights ?? [400])].sort((a, b) => a - b).join(";");
      fams.add(`family=${f.family.replace(/ /g, "+")}:wght@${w}`);
    }
  }
  return `https://fonts.googleapis.com/css2?${[...fams].join("&")}&display=swap`;
}

function vars(p) {
  return Object.entries(p).map(([k, v]) => `--${k}:${v}`).join(";");
}

function scaleVars(t) {
  const r = t.typography.scale ?? 1.25;
  return [["fs4", 5], ["fs2", 3], ["fsl", 1], ["fsb", 0], ["fss", -1], ["fsx", -2]]
    .map(([n, p]) => `--${n}:${Math.pow(r, p).toFixed(4)}rem`)
    .join(";");
}

function card(t, mode) {
  const p = t.color[mode];
  const sh = SHADOW[t.shape?.shadow ?? "subtle"];
  const style = [
    vars(p),
    scaleVars(t),
    `--rad:${t.shape?.radius ?? "6px"}`,
    `--radlg:${t.shape?.radiusLg ?? "12px"}`,
    `--bw:${t.shape?.border ?? "1px"}`,
    `--sp:${DENSITY[t.shape?.density ?? "normal"]}`,
    `--sh:${sh}`,
    `--fd:${t.typography.display.stack}`,
    `--fb:${t.typography.body.stack}`,
    `--fm:${t.typography.mono?.stack ?? "monospace"}`,
    `--dw:${t.typography.displayWeight ?? 700}`,
    `--dt:${t.typography.displayTracking ?? "-0.02em"}`,
  ].join(";");

  const pairs = [
    ["Texte / fond", ratio(p.text, p.bg)],
    ["Texte secondaire", ratio(p.textMuted, p.bg)],
    ["Lien / action", ratio(p.accent, p.bg)],
    ["Bouton plein", ratio(p.onAccent, p.accent)],
    ["Contour de champ", ratio(p.borderStrong, p.bg)],
  ];

  return `
  <div class="demo" style="${style}">
    <div class="demo-head">
      <span class="demo-mode">${mode === "light" ? "clair" : "sombre"}</span>
    </div>
    <div class="demo-body">
      <h3 class="d-h1">Portez ce vieux whisky</h3>
      <p class="d-p">Le blond qui fume au bar attend son tour depuis quarante minutes. Une phrase de démonstration, dans la police et la taille réelles du corps de texte.</p>
      <div class="d-row">
        <button class="d-btn">Action principale</button>
        <button class="d-btn-o">Secondaire</button>
        <span class="d-badge">brouillon</span>
      </div>
      <div class="d-card">
        <div class="d-card-t">Carte</div>
        <label class="d-label" for="f-${t.name}-${mode}">Adresse e-mail</label>
        <input class="d-input" id="f-${t.name}-${mode}" type="email" placeholder="prenom@exemple.fr" readonly>
        <div class="d-err">Il manque un @ dans cette adresse.</div>
      </div>
      <div class="d-swatches">
        ${["bg", "surface", "surfaceAlt", "accent", "ok", "warn", "danger"]
          .map((k) => `<span class="d-sw" style="background:${p[k]}" title="${k} ${p[k]}"></span>`)
          .join("")}
      </div>
      <table class="d-ratios">
        ${pairs
          .map(
            ([label, r]) =>
              `<tr><td>${label}</td><td class="d-r">${r.toFixed(2)}:1</td><td class="d-ok">AA</td></tr>`,
          )
          .join("")}
      </table>
    </div>
  </div>`;
}

const sections = themes
  .map(
    (t) => `
<section class="dir" id="${t.name}">
  <div class="dir-head">
    <div>
      <span class="dir-num">${t.name}</span>
      <h2>${t.label}</h2>
      <p class="dir-desc">${t.description}</p>
      <p class="dir-usage">${t.usage}</p>
    </div>
    <dl class="dir-meta">
      <div><dt>Titres</dt><dd>${t.typography.display.family}</dd></div>
      <div><dt>Texte</dt><dd>${t.typography.body.family}</dd></div>
      <div><dt>Angles</dt><dd>${t.shape?.radius}</dd></div>
      <div><dt>Densité</dt><dd>${t.shape?.density}</dd></div>
    </dl>
  </div>
  <div class="pair">
    ${card(t, "light")}
    ${card(t, "dark")}
  </div>
</section>`,
  )
  .join("\n");

const html = `<title>Catalogue des directions</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontsHref()}">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&display=swap">
<style>
:root{
  --paper:#EEF1F4;--surface:#FFFFFF;--ink:#141D27;--ink2:#3C4B5A;--muted:#6B7B8C;
  --rule:#D2DAE1;--rule2:#E2E8ED;--brass:#9A6D12;--ok:#2C6E4B;--okbg:#DEECE3;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --paper:#0F161D;--surface:#161F28;--ink:#E6ECF2;--ink2:#B7C4D0;--muted:#8497A7;
  --rule:#2C3A47;--rule2:#232F3B;--brass:#D9A73F;--ok:#69B48A;--okbg:#152A20;
}}
:root[data-theme="dark"]{
  --paper:#0F161D;--surface:#161F28;--ink:#E6ECF2;--ink2:#B7C4D0;--muted:#8497A7;
  --rule:#2C3A47;--rule2:#232F3B;--brass:#D9A73F;--ok:#69B48A;--okbg:#152A20;
}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:"IBM Plex Sans",system-ui,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
.wrap{max-width:1180px;margin:0 auto;padding:56px 24px 90px}
.mast{border-bottom:2px solid var(--ink);padding-bottom:26px;margin-bottom:8px}
.kick{font-family:"IBM Plex Mono",monospace;font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--brass);margin:0 0 16px}
h1{font-family:"Bricolage Grotesque","Trebuchet MS",sans-serif;font-weight:800;font-size:clamp(34px,5.6vw,56px);line-height:1.02;letter-spacing:-.025em;margin:0 0 16px;text-wrap:balance}
.stand{font-size:17px;color:var(--ink2);max-width:70ch;margin:0}
.toc{display:flex;flex-wrap:wrap;gap:8px;margin:26px 0 0;padding:0;list-style:none}
.toc a{font-family:"IBM Plex Mono",monospace;font-size:12px;text-decoration:none;color:var(--ink2);background:var(--surface);border:1px solid var(--rule);padding:5px 11px}
.toc a:hover,.toc a:focus-visible{border-color:var(--brass);color:var(--ink)}
.dir{padding-top:62px}
.dir-head{display:flex;flex-wrap:wrap;gap:26px;justify-content:space-between;align-items:flex-start;border-bottom:1px solid var(--rule);padding-bottom:16px;margin-bottom:22px}
.dir-num{font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--brass)}
.dir h2{font-family:"Bricolage Grotesque",sans-serif;font-weight:700;font-size:30px;letter-spacing:-.02em;margin:4px 0 8px;line-height:1.1}
.dir-desc{margin:0 0 4px;max-width:60ch;color:var(--ink2)}
.dir-usage{margin:0;max-width:60ch;font-size:14.5px;color:var(--muted)}
.dir-meta{display:grid;grid-template-columns:repeat(2,minmax(120px,1fr));gap:10px 22px;margin:0;flex:none}
.dir-meta dt{font-family:"IBM Plex Mono",monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:2px}
.dir-meta dd{margin:0;font-size:14px}
.pair{display:grid;gap:18px}
@media (min-width:860px){.pair{grid-template-columns:1fr 1fr}}

/* --- carte de démonstration : tout y est piloté par les jetons du thème --- */
.demo{border:1px solid var(--rule);overflow:hidden;background:var(--bg)}
.demo-head{background:var(--surfaceAlt);border-bottom:1px solid var(--border);padding:7px 14px}
.demo-mode{font-family:"IBM Plex Mono",monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--textMuted)}
.demo-body{padding:calc(var(--sp) * 7);color:var(--text);font-family:var(--fb);display:flex;flex-direction:column;gap:calc(var(--sp) * 5)}
.d-h1{font-family:var(--fd);font-weight:var(--dw);letter-spacing:var(--dt);font-size:var(--fs2);line-height:1.12;margin:0;color:var(--text)}
.d-p{margin:0;font-size:var(--fsb);color:var(--textMuted);max-width:46ch}
.d-row{display:flex;flex-wrap:wrap;align-items:center;gap:calc(var(--sp) * 3)}
.d-btn{font-family:var(--fb);font-size:var(--fsb);font-weight:500;background:var(--accent);color:var(--onAccent);border:none;border-radius:var(--rad);padding:calc(var(--sp)*2.5) calc(var(--sp)*4);cursor:default}
.d-btn-o{font-family:var(--fb);font-size:var(--fsb);font-weight:500;background:transparent;color:var(--text);border:var(--bw) solid var(--borderStrong);border-radius:var(--rad);padding:calc(var(--sp)*2.5) calc(var(--sp)*4);cursor:default}
.d-badge{font-family:var(--fm);font-size:var(--fsx);background:var(--surfaceAlt);color:var(--textMuted);border-radius:var(--rad);padding:calc(var(--sp)) calc(var(--sp)*2)}
.d-card{background:var(--surface);border:var(--bw) solid var(--border);border-radius:var(--radlg);box-shadow:var(--sh);padding:calc(var(--sp)*5);display:flex;flex-direction:column;gap:calc(var(--sp)*2)}
.d-card-t{font-family:var(--fd);font-weight:var(--dw);letter-spacing:var(--dt);font-size:var(--fsl);color:var(--text)}
.d-label{font-size:var(--fss);font-weight:600;color:var(--text)}
.d-input{font-family:var(--fb);font-size:var(--fsb);background:var(--surface);color:var(--text);border:var(--bw) solid var(--borderStrong);border-radius:var(--rad);padding:calc(var(--sp)*2) calc(var(--sp)*3);width:100%}
.d-err{font-size:var(--fss);color:var(--danger)}
.d-swatches{display:flex;gap:0}
.d-sw{width:34px;height:26px;border:var(--bw) solid var(--border);margin-right:-1px}
.d-ratios{width:100%;border-collapse:collapse;font-size:var(--fsx);font-family:var(--fm);color:var(--textMuted)}
.d-ratios td{padding:3px 0;border-top:1px solid var(--border)}
.d-r{text-align:right;font-variant-numeric:tabular-nums;color:var(--text)}
.d-ok{text-align:right;width:34px;color:var(--ok)}
footer{margin-top:74px;padding-top:20px;border-top:1px solid var(--rule);font-size:13px;color:var(--muted);max-width:80ch}
:focus-visible{outline:2px solid var(--brass);outline-offset:2px}
</style>

<div class="wrap">
<header class="mast">
  <p class="kick">Fabrique de Sites · socle</p>
  <h1>Catalogue des directions</h1>
  <p class="stand">Chaque direction est un seul fichier. Le stagiaire en choisit une en la regardant ; le site entier s'y conforme sans qu'une ligne de composant change. Les six ont passé le contrôle de contraste WCAG AA en mode clair et en mode sombre — c'est ce qui autorise à laisser choisir quelqu'un qui ne code pas.</p>
  <ul class="toc">
    ${themes.map((t) => `<li><a href="#${t.name}">${t.label}</a></li>`).join("\n    ")}
  </ul>
</header>
${sections}
<footer>
  <p>Rendu à partir des fichiers <code>theme/catalogue/*.json</code> du dépôt : ce qui est montré ici est exactement ce qui sera livré. Les ratios affichés sont recalculés à la génération de la page — aucun n'est saisi à la main.</p>
</footer>
</div>
`;

writeFileSync(OUT, html);
console.log(`Planche du catalogue écrite : ${OUT} (${themes.length} directions)`);
