import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-slate-500 sm:flex-row">
        <span>© 2026 Sujets BF. Tous droits réservés.</span>
        <nav className="flex items-center gap-4">
          <Link href="/a-propos" className="transition hover:text-slate-900">
            À propos
          </Link>
          <Link href="/conditions" className="transition hover:text-slate-900">
            Conditions
          </Link>
          <Link href="/confidentialite" className="transition hover:text-slate-900">
            Confidentialité
          </Link>
          <Link href="/contact" className="transition hover:text-slate-900">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
