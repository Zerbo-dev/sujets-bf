'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ConnexionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get('reason') === 'session_expired';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError('Email ou mot de passe incorrect.');
      return;
    }

    router.push(searchParams.get('next') ?? '/');
    router.refresh();
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setResetLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email);
    setResetLoading(false);
    setResetSent(true);
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Connexion</h1>
        <p className="mt-1 text-sm text-slate-600">
          Accédez à votre compte pour continuer.
        </p>

        {sessionExpired && (
          <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Votre session a expiré. Reconnectez-vous pour continuer.
          </p>
        )}

        {showReset ? (
          resetSent ? (
            <p className="mt-6 text-sm text-slate-600">
              Si un compte existe pour <span className="font-medium text-slate-900">{email}</span>,
              un lien de réinitialisation vient d&apos;être envoyé.
            </p>
          ) : (
            <form onSubmit={handleReset} className="mt-6 space-y-4">
              <p className="text-sm text-slate-600">
                Entrez votre email, nous vous envoyons un lien pour choisir un
                nouveau mot de passe.
              </p>
              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full rounded-md bg-brand py-2.5 font-medium text-white transition hover:bg-brand-dark disabled:opacity-60"
              >
                {resetLoading ? 'Envoi…' : 'Envoyer le lien'}
              </button>
              <button
                type="button"
                onClick={() => setShowReset(false)}
                className="w-full text-center text-sm text-slate-500 hover:underline"
              >
                Retour à la connexion
              </button>
            </form>
          )
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand/30"
                  />
                  Se souvenir de moi
                </label>
                <button
                  type="button"
                  onClick={() => setShowReset(true)}
                  className="font-medium text-brand hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-brand py-2.5 font-medium text-white transition hover:bg-brand-dark disabled:opacity-60"
              >
                {loading ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>

            <p className="mt-4 text-sm text-slate-600">
              Pas de compte ?{' '}
              <Link href="/inscription" className="font-medium text-brand hover:underline">
                S&apos;inscrire
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
