---
name: qa-visuelle
description: Regarder réellement un site déployé — captures multi-largeurs en clair et en sombre, audit d'accessibilité, régression visuelle, puis critique de la mise en page et de la typographie. Se déclenche sur « à quoi ça ressemble », « vérifie le rendu », « QA visuelle », « teste l'affichage sur mobile », « le design est-il correct », ou après la publication d'une preview.
Regarder le site, pas seulement le code
Un agent qui n'a jamais vu la page qu'il a écrite valide des mises en page
cassées avec une confiance parfaite. Cette skill décrit comment mettre des yeux
dans la boucle, et où.
Où le navigateur peut tourner
C'est la contrainte structurante, et elle n'est pas négociable : une session
Claude n'atteint pas forcément l'internet ouvert. Selon la politique réseau de
l'organisation, un bac à sable cloud peut n'avoir accès qu'à une liste blanche
(GitHub, l'API Anthropic) — auquel cas ni `curl`, ni Playwright, ni aucun
navigateur local ne joindra une URL de preview.
Trois emplacements possibles, par ordre de préférence :
Le runner GitHub Actions — accès internet complet, s'exécute à chaque
preview, sans personne. C'est là que doit vivre la QA visuelle systématique.
Workflow `agent-qa-visuelle.yml`, script `scripts/qa-visuelle.mjs`.
Le navigateur de Claude (`mcp__Claude_Browser__*` dans l'application de
bureau, `mcp__remote-devices__Claude_Browser__*` depuis le cloud quand la
session est reliée à un ordinateur) — pour l'inspection ponctuelle, quand on
veut voir une page tout de suite. Préférer `get_page_text` pour lire, et une
capture seulement quand c'est la mise en page qui est en question.
Le bac à sable de la session, uniquement si l'URL cible est joignable.
Vérifier avant de s'y engager : `curl -sS -o /dev/null -w "%{http_code}" <url>`.
Un `403 CONNECT tunnel failed` signifie que la politique réseau bloque — ne
pas insister, basculer sur 1.
Ce que la CI produit à chaque preview
`node scripts/qa-visuelle.mjs <url> qa-visuelle` écrit, pour chaque page du brief :
des captures pleine page à 390, 768 et 1440 px, en clair et en sombre ;
un audit axe-core (WCAG 2.1 A et AA) sur la vue bureau ;
deux contrôles qu'aucune capture ne révèle d'elle-même : le fond de page est-il
opaque (un fond transparent fait afficher le texte d'un thème sur l'autre), et
y a-t-il exactement un `h1` ;
un `rapport.json` qui résume le tout.
Le workflow publie les images en artefact et les résume en commentaire de pull
request.
Comment regarder les images depuis une session
Les artefacts d'une exécution sont accessibles par l'API GitHub, qui reste
joignable même sous politique réseau restrictive. Récupérer une image, l'écrire
dans le bac à sable, puis l'ouvrir avec l'outil de lecture : à partir de là, tu
vois réellement les pixels et tu peux critiquer.
Ne conclus jamais « le rendu est correct » sans avoir ouvert au moins la vue
mobile et la vue sombre. Ce sont les deux qui cassent, et ce sont les deux que
personne ne regarde.
Régression visuelle
`tests/e2e/apparence.spec.ts` compare chaque combinaison page × largeur × thème à
une image de référence versionnée dans le dépôt. Toute dérive au-delà de 1,5 % de
pixels fait échouer la pull request et produit un comparatif attendu / obtenu /
différence.
Quand la différence est voulue, régénérer les références
(`npx playwright test --update-snapshots`) et le dire dans la PR. Une référence
régénérée sans explication est une régression acceptée par distraction.
Piège : attendre `document.fonts.ready` avant la capture. Sans cela, la référence
est enregistrée avec la police de repli et toutes les exécutions suivantes
échouent pour une mauvaise raison.
Critiquer ce qu'on voit
Une fois les captures sous les yeux, la question n'est plus « est-ce que ça
marche » mais « est-ce que c'est bien fait ». Les défauts qui reviennent le plus
souvent dans une page produite par un agent :
Une hiérarchie plate — trois niveaux de titre à la même taille apparente,
rien qui guide le regard vers l'action principale.
Des espacements incohérents — des marges à l'œil plutôt qu'une échelle.
Dans le socle, l'espacement vient de la densité du thème : une valeur écrite en
dur est un défaut, pas un choix.
Des lignes trop longues — au-delà de 75 caractères, le texte cesse d'être
lu. Vérifier sur la vue bureau, où le problème apparaît.
Le débordement horizontal — un tableau, un bloc de code, une image large qui
fait glisser toute la page sur mobile. C'est le défaut le plus fréquent et le
plus visible pour un visiteur.
L'accent partout — une couleur d'action utilisée pour six choses ne signale
plus rien. Une seule action principale par écran.
Le mode sombre calculé plutôt que composé — contrastes fatigués, accent qui
perd sa lisibilité, ombres invisibles.
Les skills `design:design-critique` et `design:accessibility-review` conduisent
une revue plus complète quand l'enjeu le justifie ; `artifact-design` porte les
principes de composition et les défauts esthétiques typiques d'une production
automatique.
Un avertissement sur les skills tierces
Des catalogues en ligne proposent des skills de test visuel toutes faites. Une
skill installée dans ce dispositif s'exécute dans la CI, avec accès en écriture
au dépôt et aux secrets d'organisation. Avant d'en installer une : lire son
contenu intégralement, vérifier qui la publie, et l'épingler à une version. Les
capacités décrites par ces catalogues — captures multi-largeurs, contraste,
parcours fumée — sont déjà couvertes ici par une centaine de lignes qu'on
contrôle. Le gain d'une dépendance externe est faible ; le risque de chaîne
d'approvisionnement ne l'est pas.
