'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function InscriptionPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Après un signUp réussi, on affiche un écran "vérifiez vos mails" plutôt
  // que de rediriger en silence — l'utilisateur doit savoir qu'un mail de
  // confirmation vient de partir et qu'il doit cliquer dessus avant de
  // pouvoir se connecter.
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Si Supabase a déjà ouvert une session (confirmation email désactivée
    // côté projet), on peut aller directement à l'accueil connecté.
    if (data.session) {
      router.push('/');
      router.refresh();
      return;
    }

    setSubmittedEmail(email);
  }

  if (submittedEmail) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand/10">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-7 w-7 text-brand-deep"
          >
            <path
              d="M3 7.5 12 13l9-5.5M4.5 5h15A1.5 1.5 0 0 1 21 6.5v11A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-11A1.5 1.5 0 0 1 4.5 5Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mt-5 text-2xl font-bold">Vérifiez votre boîte mail</h1>
        <p className="mt-2 text-slate-600">
          Nous avons envoyé un lien de confirmation à{' '}
          <span className="font-medium text-slate-900">{submittedEmail}</span>.
          Ouvrez-le pour activer votre compte — pensez à regarder dans les
          spams si vous ne le voyez pas d&apos;ici quelques minutes.
        </p>
        <Link
          href="/connexion"
          className="mt-6 text-sm font-medium text-brand-deep hover:underline"
        >
          Retour à la connexion
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-bold">Créer un compte</h1>
      <p className="mt-1 text-sm text-slate-600">
        Rejoignez la communauté des contributeurs.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="text"
          required
          placeholder="Nom / Pseudonyme"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <input
          type="password"
          required
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brand py-2.5 font-medium text-white transition hover:bg-brand-deep disabled:opacity-60"
        >
          {loading ? 'Création…' : "S'inscrire"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Déjà un compte ?{' '}
        <Link href="/connexion" className="font-medium text-brand-deep hover:underline">
          Se connecter
        </Link>
      </p>
    </main>
  );
}
