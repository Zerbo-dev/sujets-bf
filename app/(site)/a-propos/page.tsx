export default function AProposPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-2xl font-bold text-slate-900">À propos du projet</h1>
      <p className="mt-4 text-slate-600">
        Sujets BF est une plateforme dédiée à la collecte et à la
        préservation des anciens sujets scolaires du Burkina Faso.
      </p>
      <p className="mt-3 text-slate-600">
        Notre objectif est de constituer une archive numérique fiable et
        accessible pour les générations futures.
      </p>

      <h2 className="mt-10 text-lg font-semibold text-slate-900">Nos examens</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <ExamCard label="École primaire" name="CEP" icon={<path d="M4 19V6a2 2 0 0 1 2-2h9l5 5v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />} />
        <ExamCard label="Collège" name="BEPC" icon={<path d="M12 3 2 8l10 5 10-5-10-5Zm-6 9v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />} />
        <ExamCard label="Lycée" name="BAC" icon={<path d="M4 4h16v4H4V4Zm2 4v12M18 8v12M9 8v12m6-12v12" />} />
      </div>
    </main>
  );
}

function ExamCard({ label, name, icon }: { label: string; name: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          {icon}
        </svg>
      </span>
      <p className="mt-3 font-semibold text-slate-900">{name}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
