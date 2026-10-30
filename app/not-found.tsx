import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

// Next.js ne fait passer une route inconnue que par le layout racine, pas
// par les layouts imbriqués (ex. app/(site)/layout.tsx) — donc header et
// footer sont inclus ici manuellement pour garder une page 404 cohérente
// avec le reste du site.
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex flex-1 max-w-md flex-col items-center justify-center px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-brand">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-8 w-8">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m20 20-3.5-3.5M8.5 8.5l5 5m0-5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <p className="mt-6 text-4xl font-bold text-slate-900">404</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">Page introuvable</h1>
        <p className="mt-2 text-slate-600">
          Cette page n&apos;existe pas ou n&apos;est plus disponible.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-md bg-brand px-5 py-2.5 font-medium text-white transition hover:bg-brand-dark"
        >
          Retour à l&apos;accueil
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
