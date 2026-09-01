---
name: direction-artistique
description: Choisir ou composer l'identité visuelle d'un site, et produire les design tokens correspondants. Se déclenche sur « quel style », « choisir un design », « changer l'apparence du site », « adapter à notre charte », « je veux un look plus », ou après un cadrage de site quand le style reste à trancher.
Donner un style à un site
Un principe gouverne tout : un socle, une peau. Les composants ne changent
jamais d'un site à l'autre ; seule change une couche de jetons décrite dans un
fichier. Changer de style ne touche donc aucune ligne de composant.
Ne jamais faire
Réinventer le CSS pour chaque projet. C'est l'erreur la plus fréquente du
vibe coding et elle ne se voit qu'au troisième site : dérive visuelle,
contrastes non conformes, composants qui se comportent différemment, aucune
maintenance possible.
Écrire une couleur, une taille de police, un rayon ou une ombre en dur dans
une page. Si un utilitaire manque, on l'ajoute au bloc `@theme` du socle.
Demander « quel style veux-tu ? » à quelqu'un qui n'a pas le vocabulaire.
On montre, on ne demande pas de décrire.
La frontière à ne jamais franchir
Claude Design produit des maquettes : des planches visuelles qu'une personne peut
retoucher à la main, déplacer, réécrire. C'est excellent pour décider à quoi
ressemblera un site, et pour le montrer à un client avant qu'une ligne de code
existe.
Ce n'est pas la source de vérité du site. Une maquette est un rendu figé ; le
site, lui, est fait de composants et de jetons. Si le code d'un site est
généré depuis une maquette, on perd le principe « un socle, une peau » et on
retombe exactement dans le travers décrit plus haut : du CSS sur mesure par
projet, ingérable au troisième site.
Le passage de l'un à l'autre se fait donc par extraction de décisions, pas par
export de code :
```
Claude Design            →   décisions              →   theme.json      →   le socle construit
(maquette, exploration)      palette, polices,           (jetons)            (composants figés)
                             rayons, densité
```
La maquette reste l'artefact que voit le client. Les jetons restent la vérité
technique. Les deux évoluent, mais jamais l'un ne remplace l'autre.
Où Claude Design est le bon outil
Proposer deux ou trois directions à un client avant tout code, sur un
canevas qu'il peut annoter et retoucher lui-même.
Maquetter une page qui n'existe pas encore — une page d'accueil, un tunnel
d'inscription — pour valider la structure avant de la construire.
Faire trancher entre deux mises en page : deux plans de travail côte à côte
valent mieux qu'un paragraphe de description.
Une fois la maquette validée : lis-la, extrais palette, appariement
typographique, rayons et densité, compose le `theme.json` correspondant, et fais
passer le contrôle de contraste. Si la maquette échoue au contrôle, c'est la
maquette qu'on corrige, pas le contrôle qu'on assouplit — et c'est une bonne
nouvelle : le défaut est trouvé avant le développement, pas après la livraison.
Raccourci utile et à manier avec prudence : une maquette peut être importée
directement dans Vercel pour donner au client une adresse cliquable en quelques
minutes. C'est une maquette en ligne, pas un site : elle ne passe ni par le
socle, ni par les garde-fous, ni par la CI. Ne jamais la présenter comme une
livraison, ne jamais lui brancher un domaine client.
Publier le système de design pour l'organisation
Les composants du socle et le catalogue de directions peuvent être publiés comme
projet Design System sur claude.ai/design, avec une vignette par composant.
C'est le moyen de rendre le système consultable par toute l'organisation sans
donner accès au dépôt.
La synchronisation demande une autorisation ponctuelle (`/design-login` depuis une
session interactive, ou « Send to Claude Code Web » depuis Claude Design). Une
fois accordée, elle se fait composant par composant — jamais en remplacement
global.
Trois chemins
1. Choisir dans le catalogue — le cas courant
Le socle contient des directions prêtes, chacune décrite dans
`theme/catalogue/*.json`. Génère la planche visuelle et montre-la :
```bash
node scripts/build-catalogue-page.mjs catalogue.html
```
Publie-la en artifact et demande simplement : « Laquelle correspond le mieux à ce
que tu as en tête ? » Chaque direction porte une phrase d'usage écrite pour un
non-technicien (« PME et sites institutionnels qui doivent inspirer confiance
sans surprendre ») — c'est sur cette phrase que se fait le choix, pas sur les
codes hexadécimaux.
Puis applique :
```bash
# theme/active.json -> { "direction": "editorial" }
npm run theme:build
```
2. Partir d'une charte existante
Quand le client a déjà un logo, des couleurs et des polices :
Récupère les éléments — la skill `brand-guidelines` et le connecteur Canva
(`list-brand-kits`, `get-design-dataset`) extraient palette et typographies
d'un brand kit existant.
Compose un nouveau fichier dans `theme/catalogue/` en partant de la direction
la plus proche.
Fais passer le contrôle, obligatoirement (voir plus bas).
3. Composer une direction nouvelle
Copie la direction la plus proche, ajuste, contrôle. Renseigne toujours `usage` :
une direction sans phrase d'usage est inutilisable par un non-technicien, donc
inutilisable tout court.
Points d'attention en composant :
Le neutre est un choix. Un gris pur lit comme un oubli ; un gris légèrement
teinté vers l'accent lit comme une décision.
La densité et les rayons portent autant de sens que la couleur. Un site
institutionnel respire ; un tableau de bord se resserre.
Le mode sombre n'est pas une inversion. Recompose-le, ne le calcule pas.
Le contrôle qui rend tout cela sûr
```bash
npm run theme:check
```
Il vérifie, pour chaque direction, le contraste WCAG AA de toutes les paires
texte/fond en clair et en sombre, plus le contour des champs de saisie à 3:1.
Une direction qui échoue n'entre pas dans le catalogue et la CI refuse la pull
request.
C'est ce contrôle — et lui seul — qui autorise à laisser un non-technicien
choisir un style sans risquer de livrer un site illisible. Ne le contourne
jamais, ne le désactive jamais « juste pour cette fois ».
Produire la planche de validation
Avant qu'une seule page réelle soit écrite, la personne doit voir le style
appliqué à de vrais composants. Deux moyens, dans cet ordre de préférence :
La page d'accueil du socle est déjà une planche de style : elle affiche la
palette, l'échelle typographique et tous les composants dans la direction
active. Une preview suffit.
La planche du catalogue générée ci-dessus, quand il faut comparer plusieurs
directions côte à côte.
Attends une validation explicite avant de déclencher le Builder. Un style validé
tard coûte tout le travail fait entre-temps.
Rendre compte
Quand tu proposes une direction, dis pourquoi elle convient à ce public, en
une phrase sans jargon. « Les caractères sont larges et les contrastes forts :
tes visiteurs sont majoritairement sur téléphone, souvent en extérieur » est une
justification. « C'est plus moderne » n'en est pas une.
