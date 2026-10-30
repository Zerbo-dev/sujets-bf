'use client';

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-8 w-8">
          <path
            d="M8.5 3h7L21 8.5v7L15.5 21h-7L3 15.5v-7L8.5 3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M12 8v5m0 3v.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <h1 className="mt-6 text-xl font-semibold text-slate-900">Connexion perdue</h1>
      <p className="mt-2 text-slate-600">
        Veuillez vérifier votre connexion internet et réessayer.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-brand px-5 py-2.5 font-medium text-white transition hover:bg-brand-dark"
        >
          Réessayer
        </button>
        <a href="/" className="rounded-md border border-slate-300 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50">
          Retour à l&apos;accueil
        </a>
      </div>
    </main>
  );
}
