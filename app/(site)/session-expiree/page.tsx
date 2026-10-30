import Link from 'next/link';

export default function SessionExpireePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-brand">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-8 w-8">
          <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <h1 className="mt-6 text-xl font-semibold text-slate-900">Votre session a expiré</h1>
      <p className="mt-2 text-slate-600">
        Pour continuer, veuillez vous reconnecter.
      </p>
      <Link
        href="/connexion"
        className="mt-6 rounded-md bg-brand px-5 py-2.5 font-medium text-white transition hover:bg-brand-dark"
      >
        Se connecter
      </Link>
      <Link href="/" className="mt-3 text-sm font-medium text-brand hover:underline">
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
