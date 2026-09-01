---
name: garde-fous
description: Le référentiel opposable de la fabrique — sécurité, données personnelles, accessibilité, secrets, paiement. À charger avant d'auditer une pull request, avant de créer une table, avant de brancher un paiement, ou quand quelqu'un demande « est-ce qu'on a le droit de » ou « est-ce que c'est sûr ».
Garde-fous
Une règle qui dépend de la bonne volonté d'un agent n'est pas une règle. Chacune
de celles qui suivent est adossée à un mécanisme qui l'applique sans intervention
humaine. Quand tu audites, vérifie le mécanisme, pas seulement le code.
Secrets
Aucune clé, aucun jeton, aucune URL contenant un identifiant dans le dépôt —
y compris dans un commentaire, un fichier de test ou un exemple.
`.env.example` ne contient que des noms de variables, jamais de valeur.
Les valeurs vivent dans les variables d'environnement Vercel, séparées par
environnement. Preview et Development ne reçoivent que des valeurs de test.
Une clé poussée par erreur reste dans l'historique git après suppression :
la corriger, c'est faire tourner la clé, pas la retirer du fichier.
Mécanisme : job `secrets` de la CI + push protection GitHub.
Données (Supabase)
Toute table a une politique RLS. Une migration qui crée une table crée sa
politique dans le même fichier.
La politique par défaut est le refus : on autorise explicitement, on n'interdit
pas au cas par cas.
La clé `service_role` ne sort jamais du serveur, et n'existe qu'en Production.
Les migrations sont versionnées dans `supabase/migrations/`. Aucun SQL
improvisé en production.
Une PR touchant aux migrations ou aux politiques porte le label
`revue:donnees` et exige une revue humaine.
Mécanisme : `get_advisors` en CI + label bloquant.
Données personnelles
Dès qu'un formulaire collecte une donnée personnelle — nom, e-mail, téléphone,
message libre :
finalité annoncée en clair à côté du champ ou du bouton ;
base légale identifiée (le plus souvent le consentement ou l'intérêt
légitime) ;
durée de conservation définie et écrite ;
lien vers la politique de confidentialité visible au moment de l'envoi ;
aucun traceur tiers avant consentement — ni analytics, ni police
distante non essentielle, ni pixel.
Les données de santé, d'opinion, d'origine ou de vie privée relèvent d'un régime
plus strict : si un formulaire en collecte, arrête et pose la question dans la
PR au lieu de décider.
Mécanisme : contrôle de l'Auditeur + revue humaine.
Paiement
Clés de test dans tous les environnements sauf Production.
Les clés live sont posées à la main par le responsable, jamais par un agent.
Le montant est calculé côté serveur, à partir du catalogue serveur. Un prix
qui arrive du navigateur est un prix qu'un visiteur peut modifier.
Les webhooks vérifient la signature Stripe, et sont idempotents.
Toute PR touchant au tunnel de paiement porte `revue:paiement`.
Accessibilité
Niveau AA, vérifié automatiquement — donc non négociable en pratique :
contraste 4.5:1 sur le texte, 3:1 sur les contours de champs, en clair et en
sombre ;
un seul `h1` par page, hiérarchie de titres sans saut ;
un `label` associé à chaque champ ; un message d'erreur relié par
`aria-describedby` ;
état de focus visible, tout le site utilisable au clavier ;
`alt` sur chaque image (vide si purement décorative) ;
`prefers-reduced-motion` respecté.
Mécanisme : `npm run theme:check` + axe-core dans les parcours Playwright.
Livraison
Aucun push direct sur `main` ; une pull request, une approbation humaine.
Les contrôles de CI sont requis par la règle de branche — sinon ils sont
décoratifs.
Aucun agent ne fusionne, aucun agent ne déploie en production.
En-têtes de sécurité présents : `X-Content-Type-Options`, `Referrer-Policy`,
`X-Frame-Options`, `Permissions-Policy`, `Strict-Transport-Security`.
Supervision
Le DSN Sentry n'est renseigné qu'en Production. Une preview qui remonte ses
erreurs noie les vraies alertes et déclenche le Gardien pour rien.
`sendDefaultPii` reste à `false` : ni cookies, ni en-têtes, ni corps de requête
ne partent chez un tiers sans décision explicite.
Sur un site public, le chargement du traceur navigateur est conditionné au
consentement au même titre qu'un outil de mesure d'audience.
`SENTRY_AUTH_TOKEN` est un secret de build : Vercel uniquement, jamais dans le
dépôt.
Dépense
Plafond de dépense configuré sur Vercel.
`--max-turns` et un `timeout-minutes` sur chaque workflow d'agent.
`concurrency` avec annulation, pour qu'un push ne laisse pas cinq runs vivants.
Comment auditer
Pour chaque pull request, dans cet ordre :
Secrets — un seul suffit à tout arrêter.
Données — schéma, policies, migrations.
Données personnelles — chaque nouveau champ de formulaire.
Paiement, si concerné.
Socle — des couleurs, tailles ou rayons écrits en dur ?
Accessibilité — au-delà de ce qu'axe détecte : hiérarchie, libellés,
ordre de tabulation.
Commente en ligne, en français, en disant ce qui casse et comment le corriger.
Un commentaire d'audit qui ne dit pas quoi faire fait perdre un aller-retour.
Quand un point relève du jugement plutôt que de la règle — une durée de
conservation discutable, un consentement limite — ne tranche pas : pose la
question dans la PR et laisse un humain décider.
