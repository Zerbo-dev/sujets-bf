import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { createClient } from '@/lib/supabase/server';

export default async function AdminHistoriquePage() {
  await requireAdmin();
  const supabase = createClient();

  const { data: history } = await supabase
    .from('validation_history')
    .select(
      `id, old_status, new_status, comment, created_at,
       profiles(display_name),
       contributions(id, title, year, exams(name), subjects(name))`
    )
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold">Historique</h1>
      <p className="mt-1 text-sm text-slate-600">
        Toutes les actions administratives, les plus récentes en premier.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Contribution</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Changement</th>
              <th className="px-4 py-3">Commentaire</th>
            </tr>
          </thead>
          <tbody>
            {(history ?? []).map((h: any) => (
              <tr key={h.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-500">
                  {new Date(h.created_at).toLocaleString('fr-FR')}
                </td>
                <td className="px-4 py-3">
                  {h.contributions ? (
                    <Link
                      href={`/admin/contributions/${h.contributions.id}`}
                      className="font-medium hover:underline"
                    >
                      {h.contributions.exams?.name} {h.contributions.subjects?.name} {h.contributions.year}
                    </Link>
                  ) : (
                    <span className="text-slate-400">Contribution supprimée</span>
                  )}
                </td>
                <td className="px-4 py-3">{h.profiles?.display_name ?? '—'}</td>
                <td className="px-4 py-3">
                  {h.old_status ?? '—'} → <strong>{h.new_status}</strong>
                </td>
                <td className="px-4 py-3 text-slate-600">{h.comment || '—'}</td>
              </tr>
            ))}
            {(!history || history.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Aucune action enregistrée pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
