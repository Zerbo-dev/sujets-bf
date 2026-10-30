import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

/**
 * Header commun à toutes les pages publiques (hors /admin, qui a son
 * propre shell). Design aligné sur la maquette fournie : fond blanc,
 * logo bleu, nav simple à droite.
 */
export async function SiteHeader() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-white">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path
                d="M6 4h9l3 3v13H6V4Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path d="M9 11h6M9 14.5h6M9 17.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          Sujets BF
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hidden text-slate-600 transition hover:text-slate-900 sm:inline">
            Accueil
          </Link>
          <Link href="/a-propos" className="hidden text-slate-600 transition hover:text-slate-900 sm:inline">
            À propos
          </Link>
          {user ? (
            <>
              <Link
                href="/mes-contributions"
                className="hidden text-slate-600 transition hover:text-slate-900 sm:inline"
              >
                Mes contributions
              </Link>
              <Link
                href="/contribuer"
                className="rounded-md bg-brand px-3.5 py-1.5 font-medium text-white transition hover:bg-brand-dark"
              >
                Contribuer
              </Link>
            </>
          ) : (
            <>
              <Link href="/connexion" className="text-slate-600 transition hover:text-slate-900">
                Se connecter
              </Link>
              <Link
                href="/inscription"
                className="rounded-md bg-brand px-3.5 py-1.5 font-medium text-white transition hover:bg-brand-dark"
              >
                S&apos;inscrire
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
