import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold">Sujets BF</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/">Accueil</Link>
            <Link href="/connexion">Se connecter</Link>
            <Link
              href="/inscription"
              className="rounded-md bg-blue-600 px-3 py-1.5 font-medium"
            >
              S'inscrire
            </Link>
          </nav>
        </div>
      </header>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">
            Aidez-nous à préserver les anciens{' '}
            <span className="text-blue-400">sujets scolaires</span> du Burkina
            Faso.
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Vous possédez un ancien sujet du CEP, du BEPC ou du BAC ? Envoyez-le.
            Chaque document sera vérifié avant d'être intégré aux archives.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contribuer"
              className="rounded-md bg-blue-600 px-5 py-2.5 font-medium"
            >
              Contribuer
            </Link>
            <Link
              href="/mes-contributions"
              className="rounded-md bg-slate-800 px-5 py-2.5 font-medium"
            >
              Mes contributions
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-12 md:grid-cols-3">
        <FeatureCard
          title="Collecte"
          description="Tout le monde peut proposer un document."
        />
        <FeatureCard
          title="Vérification"
          description="Chaque fichier est vérifié par un administrateur."
        />
        <FeatureCard
          title="Archive"
          description="Les documents validés seront utilisés pour la future bibliothèque."
        />
      </section>
    </main>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  );
}
