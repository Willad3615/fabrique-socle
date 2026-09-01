#!/usr/bin/env node
// Affiche le catalogue de directions artistiques en langage clair.
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(ROOT, "theme", "catalogue");
const active = JSON.parse(readFileSync(join(ROOT, "theme", "active.json"), "utf8")).direction;

console.log("\nDirections artistiques disponibles\n");
for (const f of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
  const t = JSON.parse(readFileSync(join(dir, f), "utf8"));
  const mark = t.name === active ? "»" : " ";
  console.log(`${mark} ${t.name.padEnd(18)} ${t.label}`);
  console.log(`  ${" ".repeat(18)} ${t.usage ?? t.description ?? ""}\n`);
}
console.log(`Direction active : ${active}. Pour en changer, modifie theme/active.json puis lance npm run theme:build.\n`);
