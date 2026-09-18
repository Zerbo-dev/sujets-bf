import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sujets BF — Collecte des sujets scolaires du Burkina Faso',
  description:
    "Aidez à préserver les anciens sujets scolaires (CEP, BEPC, BAC) du Burkina Faso.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
