import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Contrôles du socle : ils s'appliquent à TOUS les sites de la fabrique.
 * Les parcours propres à un site s'ajoutent dans un fichier séparé, écrit à
 * partir du brief.
 */

test("la page se charge et annonce un titre unique", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page).toHaveTitle(/./);
});

test("aucune violation d'accessibilité détectable automatiquement", async ({ page }) => {
  await page.goto("/");
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  // Le rapport doit être lisible sans ouvrir un outil : on nomme la règle et l'élément.
  const lisible = violations.map((v) => ({
    regle: v.id,
    impact: v.impact,
    description: v.help,
    elements: v.nodes.map((n) => n.target.join(" ")),
  }));
  expect(lisible, JSON.stringify(lisible, null, 2)).toEqual([]);
});

test("le site est utilisable au clavier : le lien d'évitement vient en premier", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Aller au contenu" })).toBeFocused();
});

test("le mode sombre s'applique sans casser le texte", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const fond = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  // Un fond transparent signifie que la page emprunte celui de son hôte : bug classique.
  expect(fond).not.toBe("rgba(0, 0, 0, 0)");
});

test("les en-têtes de sécurité sont présents", async ({ page }) => {
  const reponse = await page.goto("/");
  const entetes = reponse!.headers();
  expect(entetes["x-content-type-options"]).toBe("nosniff");
  expect(entetes["referrer-policy"]).toBe("strict-origin-when-cross-origin");
});
