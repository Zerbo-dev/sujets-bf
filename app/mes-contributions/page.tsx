import Link from 'next/link';
import { requireUser } from '@/lib/auth/requireAdmin';
import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/StatusBadge';

export default async function MesContributionsPage() {
  const user = await requireUser();
  const supabase = createClient();

  // RLS limite déjà ce select aux contributions de l'utilisateur connecté,
  // le .eq('user_id', ...) est une confirmation explicite côté requête.
  const { data: contributions } = await supabase
    .from('contributions')
    .select('id, title, year, status, created_at, exams(name), subjects(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes contributions</h1>
        <Link href="/contribuer" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">
          Contribuer
        </Link>
      </div>

      {(!contributions || contributions.length === 0) && (
        <p className="mt-6 text-slate-600">
          Vous n'avez encore envoyé aucun document.
        </p>
      )}

      {contributions && contributions.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Sujet</th>
                <th className="px-4 py-3">Année</th>
                <th className="px-4 py-3">Matière</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {contributions.map((c: any) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{c.exams?.name}</td>
                  <td className="px-4 py-3">{c.year}</td>
                  <td className="px-4 py-3">{c.subjects?.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(c.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
