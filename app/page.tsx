import { Badge, Button, Card, CardBody, CardTitle, Field } from "@/components/ui";
import { activeTheme } from "@/lib/theme.generated";

export const metadata = { title: "Planche de style" };

const SWATCHES = [
  { token: "--c-bg", name: "Fond de page" },
  { token: "--c-surface", name: "Carte" },
  { token: "--c-surface-alt", name: "Fond secondaire" },
  { token: "--c-accent", name: "Action" },
  { token: "--c-ok", name: "Validé" },
  { token: "--c-warn", name: "Attention" },
  { token: "--c-danger", name: "Erreur" },
  { token: "--c-border-strong", name: "Contour de champ" },
];

const SIZES = [
  { cls: "text-4xl", label: "Titre de page" },
  { cls: "text-2xl", label: "Titre de section" },
  { cls: "text-lg", label: "Sous-titre" },
  { cls: "text-base", label: "Texte courant" },
  { cls: "text-sm", label: "Légende" },
];

export default function Page() {
  return (
    <main id="contenu" className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-16">
        <Badge tone="accent">Planche de style</Badge>
        <h1 className="mt-4 text-4xl">{activeTheme.label}</h1>
        <p className="mt-4 max-w-[62ch] text-lg text-muted">{activeTheme.description}</p>
        <p className="mt-2 max-w-[62ch] text-muted">{activeTheme.usage}</p>
      </header>

      <section className="mb-16">
        <h2 className="mb-4 text-2xl">Couleurs</h2>
        <div className="rule grid grid-cols-2 gap-px overflow-hidden rounded-theme bg-line sm:grid-cols-4">
          {SWATCHES.map((s) => (
            <div key={s.token} className="bg-surface p-3">
              <div
                className="rule mb-2 h-12 rounded-theme"
                style={{ background: `var(${s.token})` }}
              />
              <div className="text-sm">{s.name}</div>
              <div className="font-mono text-xs text-muted">{s.token}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-4 text-2xl">Échelle typographique</h2>
        <div className="flex flex-col gap-3">
          {SIZES.map((s) => (
            <div key={s.cls} className="flex flex-wrap items-baseline gap-4">
              <span className={`font-display ${s.cls}`}>Portez ce vieux whisky</span>
              <span className="font-mono text-xs text-muted">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-4 text-2xl">Composants</h2>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Action principale</Button>
            <Button variant="outline">Action secondaire</Button>
            <Button variant="ghost">Lien d&apos;action</Button>
            <Button disabled>Indisponible</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge tone="ok">Recette validée</Badge>
            <Badge tone="warn">Revue attendue</Badge>
            <Badge tone="danger">Contrôle en échec</Badge>
            <Badge>Brouillon</Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardTitle>Carte</CardTitle>
              <CardBody>
                La surface, le rayon, l&apos;ombre et l&apos;épaisseur du trait viennent tous des
                jetons de la direction artistique.
              </CardBody>
            </Card>
            <Card>
              <div className="flex flex-col gap-4">
                <Field
                  label="Adresse e-mail"
                  type="email"
                  placeholder="prenom@exemple.fr"
                  hint="Sert uniquement à vous répondre."
                />
                <Field
                  label="Adresse e-mail"
                  type="email"
                  defaultValue="prenom.exemple"
                  error="Il manque un @ dans cette adresse. Exemple : prenom@exemple.fr"
                />
              </div>
            </Card>
          </div>
        </div>
      </section>

      <footer className="rule-t pt-6 text-sm text-muted">
        <p>
          Cette page est la planche de style du site : elle rend la direction artistique visible
          avant qu&apos;une seule page réelle soit écrite. Pour changer de style, modifier
          <code className="mx-1 font-mono">theme/active.json</code>— aucun composant ne bouge.
        </p>
      </footer>
    </main>
  );
}
