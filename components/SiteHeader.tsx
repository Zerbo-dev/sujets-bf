import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

/**
 * Header commun à toutes les pages publiques (hors /admin, qui a son
 * propre shell). Avant, seule la landing page avait un header codé en
 * dur — les autres pages (connexion, inscription…) n'en avaient aucun,
 * ce qui cassait la navigation et l'identité visuelle du site.
 */
export async function SiteHeader() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-brand-deep/20 bg-brand-deep text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span aria-hidden="true" className="text-brand">◆</span>
          Sujets BF
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          <Link href="/" className="hidden text-white/80 transition hover:text-white sm:inline">
            Accueil
          </Link>
          {user ? (
            <>
              <Link
                href="/mes-contributions"
                className="hidden text-white/80 transition hover:text-white sm:inline"
              >
                Mes contributions
              </Link>
              <Link
                href="/contribuer"
                className="rounded-md bg-brand px-3 py-1.5 font-medium text-brand-deep transition hover:bg-brand/90"
              >
                Contribuer
              </Link>
            </>
          ) : (
            <>
              <Link href="/connexion" className="text-white/80 transition hover:text-white">
                Se connecter
              </Link>
              <Link
                href="/inscription"
                className="rounded-md bg-brand px-3 py-1.5 font-medium text-brand-deep transition hover:bg-brand/90"
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
