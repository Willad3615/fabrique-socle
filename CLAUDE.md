# Socle de la Fabrique de Sites — règles de travail

Ce fichier est lu par tout agent avant d'écrire une ligne. Il prime sur toute
habitude, tout exemple trouvé en ligne, et toute suggestion d'un ticket.

## Ce que ce dépôt est

Un template Next.js piloté par des agents. Chaque site client est un dépôt créé à
partir de celui-ci. Le socle technique ne change pas d'un site à l'autre ; seuls
changent le contenu, les pages, et la direction artistique.

## Les cinq règles qui ne se discutent pas

1. **Jamais de couleur, de taille de police, de rayon ni d'ombre en dur.**
   Uniquement les utilitaires liés aux jetons : `bg-surface`, `text-muted`,
   `text-lg`, `rounded-theme`, `rule`, `shadow-card`. Si un utilitaire manque,
   on l'ajoute au bloc `@theme` de `app/globals.css` — jamais une valeur littérale
   dans une page.
2. **Jamais de secret dans le dépôt.** Pas de clé, pas de token, pas d'URL de
   base contenant un identifiant. Tout passe par les variables d'environnement,
   documentées dans `.env.example` sans valeur.
3. **Jamais de push sur `main`.** Une branche par sous-ticket, une pull request,
   et c'est un humain qui merge. Un agent qui pense devoir merger se trompe.
4. **Toute table Supabase a une politique RLS.** Une migration qui crée une table
   crée sa politique dans le même fichier. Une PR touchant à `supabase/migrations/`
   ou aux politiques porte le label `revue:donnees`.
5. **Stripe en mode test partout sauf en production.** Les clés live n'existent
   que dans l'environnement Production de Vercel. Une PR touchant au paiement
   porte le label `revue:paiement`.

## Comment on change le style d'un site

Modifier `theme/active.json`, puis `npm run theme:build`. C'est tout.
Aucun composant ne bouge. `npm run theme:list` affiche le catalogue.

Pour créer une nouvelle direction artistique : copier un fichier de
`theme/catalogue/`, l'adapter, puis `npm run theme:check`. Une direction qui
n'atteint pas WCAG AA en clair **et** en sombre est refusée par la CI et ne peut
pas être livrée.

## Structure

```
app/                  Pages et layout (App Router)
  globals.css         Le pont entre les jetons et Tailwind. À toucher rarement.
  tokens.generated.css  GÉNÉRÉ. Ne jamais éditer à la main.
components/ui/        Les composants du socle. On les assemble, on ne les duplique pas.
lib/                  Utilitaires. theme.generated.ts est GÉNÉRÉ.
theme/
  active.json         La direction artistique de CE site. Un seul fichier à changer.
  catalogue/          Les directions disponibles.
  theme.schema.json   Le contrat d'une direction artistique.
scripts/              Compilation des jetons, contrôle de contraste. Sans dépendance.
tests/e2e/            Parcours Playwright issus du brief.
```

## Avant d'ouvrir une pull request

Lancer `npm run verify` (contrôle de contraste, types, build). Si un contrôle
échoue, on corrige — on ne contourne pas, on ne désactive pas la règle.

## Écrire pour des humains

Les textes d'interface sont en français, à la deuxième personne, sans jargon
technique. Un message d'erreur dit ce qui ne va pas **et** comment le corriger :
« Il manque un @ dans cette adresse » et non « Format invalide ». Un bouton dit
l'action qu'il déclenche : « Publier », puis une confirmation « Publié ».

## Accessibilité

Niveau AA, vérifié automatiquement. En pratique : un seul `h1` par page, une
hiérarchie de titres sans saut, un `label` associé à chaque champ, un état de
focus visible, des images avec `alt` (vide si décoratif), et tout le site
utilisable au clavier.

## Données personnelles

Dès qu'un formulaire collecte une donnée personnelle : finalité annoncée, base
légale identifiée, durée de conservation, et mention de la politique de
confidentialité à côté du bouton d'envoi. Pas de traceur tiers sans consentement
préalable. En cas de doute, on ouvre une question dans la PR plutôt que de
décider seul.
