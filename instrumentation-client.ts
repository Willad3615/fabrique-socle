/**
 * Supervision navigateur (Sentry). Optionnelle, comme côté serveur.
 *
 * Attention RGPD : Sentry pose un identifiant de session et transmet des
 * informations de navigation. Sur un site public, ce chargement doit être
 * conditionné au consentement — voir la skill garde-fous.
 */
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
      tracesSampleRate: 0,
      replaysSessionSampleRate: 0,
      sendDefaultPii: false,
    });
  });
}
