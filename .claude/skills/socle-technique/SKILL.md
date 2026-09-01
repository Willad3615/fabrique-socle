---
name: socle-technique
description: Les conventions du template de la fabrique — structure, composants, jetons, tests. À charger avant d'écrire ou de modifier du code dans un site de la fabrique, et quand quelqu'un demande « comment on fait pour » à propos du socle.
Travailler dans le socle
Chaque site de la fabrique part du même dépôt template. Le socle ne change pas
d'un site à l'autre ; seuls changent le contenu, les pages et la direction
artistique. Ce qui suit prime sur toute habitude et sur tout exemple trouvé en
ligne.
Les cinq règles
Jamais de couleur, de taille, de rayon ni d'ombre en dur. Uniquement les
utilitaires liés aux jetons : `bg-surface`, `text-muted`, `text-lg`,
`rounded-theme`, `rule`, `shadow-card`. Si un utilitaire manque, on l'ajoute
au bloc `@theme` de `app/globals.css` — jamais une valeur littérale dans une
page.
Jamais de secret dans le dépôt.
Jamais de push sur `main`. Une branche par sous-ticket, une pull request,
un humain qui fusionne.
Toute table a une politique RLS, écrite dans la même migration.
Stripe en mode test partout sauf en production.
Structure
```
app/                    Pages et layout (App Router)
  globals.css           Le pont entre les jetons et Tailwind. À toucher rarement.
  tokens.generated.css  GÉNÉRÉ — ne jamais éditer à la main.
components/ui/          Les composants du socle. On les assemble, on ne les duplique pas.
lib/                    Utilitaires. theme.generated.ts est GÉNÉRÉ.
theme/
  active.json           La direction artistique de CE site.
  catalogue/            Les directions disponibles.
scripts/                Compilation des jetons, contrôle de contraste. Sans dépendance.
tests/e2e/              Parcours Playwright issus du brief.
```
Comment on ajoute une page
Un fichier dans `app/`, un seul `h1`, une `metadata` avec un titre parlant.
Les composants viennent de `components/ui`. Si un composant manque, on le
crée là, pas dans la page — il servira à tous les sites.
Un test dans `tests/e2e/` qui rejoue le parcours décrit dans le brief pour
cette page. Un parcours du brief sans test correspondant est un oubli.
Comment on ajoute une donnée
Une migration dans `supabase/migrations/`, qui crée la table et sa
politique RLS.
Les types régénérés depuis le schéma, jamais écrits à la main.
Le label `revue:donnees` posé sur la pull request.
Avant d'ouvrir une pull request
```bash
npm run verify      # contraste + types + build
npm run test:e2e    # parcours et accessibilité
```
Si un contrôle échoue, on corrige. On ne contourne pas, on ne désactive pas la
règle, on n'ajoute pas d'exception « temporaire ».
Écrire pour des humains
Textes d'interface en français, deuxième personne, sans jargon. Un message
d'erreur dit ce qui ne va pas et comment le corriger : « Il manque un @ dans
cette adresse » plutôt que « Format invalide ». Un bouton dit l'action qu'il
déclenche : « Publier », puis une confirmation « Publié ».
