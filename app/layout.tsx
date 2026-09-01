import type { Metadata } from "next";
import { activeTheme } from "@/lib/theme.generated";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Socle — Fabrique de Sites",
    template: "%s — Fabrique de Sites",
  },
  description:
    "Template Next.js de la Fabrique de Sites : design tokens interchangeables, accessibilité vérifiée en CI, prêt pour un pilotage par agents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {activeTheme.googleFontsHref && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="stylesheet" href={activeTheme.googleFontsHref} />
          </>
        )}
      </head>
      <body>
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-theme focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
        >
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}
