/**
 * Supervision serveur (Sentry).
 *
 * Entièrement optionnelle : sans NEXT_PUBLIC_SENTRY_DSN, rien ne s'initialise et
 * l'application se comporte exactement comme avant. C'est ce qui permet de faire
 * tourner les previews et le développement local sans polluer le projet Sentry.
 */
export async function register() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  const Sentry = await import("@sentry/nextjs");
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    // L'environnement distingue les erreurs de production de celles d'une preview :
    // sans cela, le Gardien alerte sur des sites qui ne sont pas en ligne.
    environment: process.env.VERCEL_ENV ?? "development",
    tracesSampleRate: process.env.VERCEL_ENV === "production" ? 0.1 : 0,
    // Aucune donnée personnelle envoyée par défaut : corps de requête, cookies et
    // en-têtes restent chez nous tant qu'un besoin explicite ne le justifie pas.
    sendDefaultPii: false,
  });
}

export async function onRequestError(...args: unknown[]) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  const Sentry = await import("@sentry/nextjs");
  // @ts-expect-error — signature transmise telle quelle par Next.
  return Sentry.captureRequestError(...args);
}
