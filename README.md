# Socle de la Fabrique de Sites

Template Next.js piloté par des agents. Chaque site client part d'une copie de ce
dépôt : le socle technique ne change jamais, seuls changent le contenu, les pages
et la direction artistique.

Trois idées structurent tout le reste :

- **Un socle, mille styles.** Toute l'identité visuelle tient dans un fichier.
  Changer de style ne touche aucun composant.
- **Les garde-fous sont dans la plateforme, pas dans les prompts.** Une règle qui
  dépend de la bonne volonté d'un agent n'est pas une règle.
- **Rien n'atteint la production sans un geste humain.** Les agents écrivent,
  testent et déploient des previews ; ils ne fusionnent pas.

## Démarrer

```bash
npm install
npm run dev          # http://localhost:3000 — la planche de style du thème actif
```

## Changer le style d'un site

```bash
npm run theme:list           # le catalogue, en langage clair
# éditer theme/active.json : { "direction": "editorial" }
npm run theme:build
```

Aucun composant ne bouge. La page d'accueil est la **planche de style** : elle rend
la direction artistique visible avant qu'une seule page réelle soit écrite.

### Créer une direction artistique

Copier un fichier de `theme/catalogue/`, l'adapter, puis :

```bash
npm run theme:check
```

Le contrôle vérifie le contraste WCAG AA de toutes les paires texte/fond, **en clair
et en sombre**. Une direction qui échoue n'entre pas dans le catalogue — la CI la
refuse. C'est ce qui permet de laisser un non-technicien choisir un style sans
risquer de livrer un site illisible.

## Vérifier avant d'ouvrir une pull request

```bash
npm run verify       # contraste + types + build
npm run test:e2e     # parcours et accessibilité
```

## Les agents

| Workflow | Déclencheur | Ce qu'il fait |
| --- | --- | --- |
| `agent-architecte` | label `fabrique:go` sur une demande | Attribue le niveau d'autonomie, propose la direction artistique, découpe en sous-tickets. N'écrit pas de code. |
| `agent-builder` | `@claude` en commentaire, ou label `fabrique:construire` | Implémente sur une branche et ouvre une pull request. |
| `agent-auditeur` | chaque pull request | Revue de code, sécurité, données personnelles. |
| `agent-gardien` | toutes les 6 heures | Surveille les PR bloquées et les échecs. Ouvre des issues, ne corrige rien. |
| `ci` | chaque pull request | Contraste, types, build, parcours, absence de secrets. **Bloquant.** |

Aucun de ces workflows ne peut fusionner une pull request ni déployer en production.

## Configuration requise

**Secrets du dépôt ou de l'organisation**

| Secret | Usage |
| --- | --- |
| `ANTHROPIC_API_KEY` | Authentifie les agents. À poser au niveau de l'organisation. |

**Règle de branche sur `main`** — sans elle, les garde-fous ci-dessus sont
décoratifs :

- interdire le push direct ;
- exiger une pull request avec au moins une approbation ;
- exiger les contrôles `Style, types et build`, `Parcours et accessibilité` et
  `Aucun secret dans le dépôt` ;
- exiger que la branche soit à jour avant fusion.

La protection de branche sur dépôt privé demande un plan GitHub Team ou supérieur.

**Variables d'environnement Vercel** — voir `.env.example`. Les clés de production
ne doivent exister que dans l'environnement Production ; Preview et Development ne
reçoivent que des clés de test.

**Supervision (Sentry)** — entièrement optionnelle : sans `NEXT_PUBLIC_SENTRY_DSN`,
rien ne s'initialise et l'application se comporte à l'identique. Pour l'activer :

1. Créer un projet Sentry (plateforme `javascript-nextjs`) et récupérer son DSN.
   Pour le socle, c'est déjà fait : organisation `sanctuaire-consulting-services`,
   projet `fabrique-socle`, hébergement en région européenne (`de.sentry.io`).
2. Poser `NEXT_PUBLIC_SENTRY_DSN` dans l'environnement **Production** de Vercel, et
   nulle part ailleurs — une preview qui remonte ses erreurs noie les vraies alertes.
3. Pour des traces lisibles, ajouter `SENTRY_ORG`, `SENTRY_PROJECT` et
   `SENTRY_AUTH_TOKEN` (secret de build, Vercel uniquement) afin que les source maps
   soient envoyées.

`sendDefaultPii` est à `false` : ni cookies, ni en-têtes, ni corps de requête ne
partent chez un tiers. Sur un site public, le chargement du traceur navigateur doit
être conditionné au consentement, au même titre qu'un outil de mesure d'audience.

## Structure

```
app/                    Pages et layout (App Router)
  globals.css           Le pont entre les jetons et Tailwind
  tokens.generated.css  GÉNÉRÉ — ne jamais éditer
components/ui/          Les composants du socle
theme/
  active.json           La direction artistique de ce site
  catalogue/            Les directions disponibles
  theme.schema.json     Le contrat d'une direction artistique
scripts/                Compilation des jetons, contrôle de contraste (sans dépendance)
tests/e2e/              Parcours et contrôles d'accessibilité
CLAUDE.md               Les règles que tout agent lit avant d'écrire
```
