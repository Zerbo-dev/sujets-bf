import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
            Préservons les anciens sujets scolaires du Burkina Faso.
          </h1>
          <p className="mt-4 max-w-md text-slate-600">
            Vous possédez un ancien sujet du CEP, du BEPC ou du BAC ?
            Envoyez-le. Chaque document est vérifié par notre équipe avant
            d&apos;être intégré aux archives.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/contribuer"
              className="rounded-md bg-brand px-5 py-2.5 font-medium text-white transition hover:bg-brand-dark"
            >
              Contribuer
            </Link>
            <Link
              href="/mes-contributions"
              className="rounded-md border border-slate-300 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Mes contributions
            </Link>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="relative flex h-56 w-56 items-center justify-center rounded-2xl bg-brand-light">
            <svg aria-hidden="true" viewBox="0 0 120 120" className="h-28 w-28 text-brand">
              <rect x="30" y="14" width="60" height="80" rx="4" fill="white" stroke="currentColor" strokeWidth="2.5" />
              <rect x="18" y="26" width="60" height="80" rx="4" fill="white" stroke="currentColor" strokeWidth="2.5" transform="rotate(-8 48 66)" />
              <line x1="26" y1="36" x2="58" y2="36" stroke="currentColor" strokeWidth="2" transform="rotate(-8 48 66)" />
              <line x1="26" y1="44" x2="58" y2="44" stroke="currentColor" strokeWidth="2" transform="rotate(-8 48 66)" />
              <line x1="26" y1="52" x2="46" y2="52" stroke="currentColor" strokeWidth="2" transform="rotate(-8 48 66)" />
            </svg>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-8 sm:grid-cols-3">
        <Feature
          title="Collecte"
          description="Proposez vos anciens sujets."
          icon={
            <path d="M12 4v11m0 0-4-4m4 4 4-4M5 17v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2" />
          }
        />
        <Feature
          title="Vérification"
          description="Chaque document est vérifié par notre équipe."
          icon={<path d="m5 13 4 4L19 7" />}
        />
        <Feature
          title="Archive"
          description="Les documents validés seront intégrés aux archives."
          icon={
            <path d="M4 7h16M4 7v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7M4 7l2-3h12l2 3M9 12h6" />
          }
        />
      </section>

      <p className="mt-12 flex items-start gap-2 rounded-lg bg-brand-light px-4 py-3 text-sm text-slate-700">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-brand">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 11v5m0-8v.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Un document envoyé n&apos;est pas automatiquement considéré comme
        officiel ni validé.
      </p>
    </main>
  );
}

function Feature({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          {icon}
        </svg>
      </span>
      <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  );
}
