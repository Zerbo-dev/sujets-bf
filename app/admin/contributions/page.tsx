import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/StatusBadge';

const STATUS_OPTIONS = [
  ['', 'Tous'],
  ['pending', 'En attente'],
  ['reviewing', 'En vérification'],
  ['needs_correction', 'Correction demandée'],
  ['approved', 'Validé'],
  ['rejected', 'Refusé'],
  ['archived', 'Archivé'],
] as const;

interface SearchParams {
  status?: string;
  exam?: string;
  year?: string;
  subject?: string;
  sort?: 'recent' | 'ancien';
}

export default async function AdminContributionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const supabase = createClient();

  const [{ data: exams }, { data: subjects }] = await Promise.all([
    supabase.from('exams').select('*').order('name'),
    supabase.from('subjects').select('*').order('name'),
  ]);

  let query = supabase
    .from('contributions')
    .select('id, title, year, status, created_at, exams(name), subjects(name), profiles(display_name)');

  if (searchParams.status) query = query.eq('status', searchParams.status);
  if (searchParams.exam) query = query.eq('exam_id', searchParams.exam);
  if (searchParams.subject) query = query.eq('subject_id', searchParams.subject);
  if (searchParams.year) query = query.eq('year', Number(searchParams.year));

  query = query.order('created_at', { ascending: searchParams.sort === 'ancien' });

  const { data: contributions } = await query;

  function buildHref(overrides: Partial<SearchParams>) {
    const params = new URLSearchParams({ ...searchParams, ...overrides } as Record<string, string>);
    // Retirer les valeurs vides pour garder l'URL propre.
    for (const [k, v] of Array.from(params.entries())) if (!v) params.delete(k);
    const qs = params.toString();
    return qs ? `/admin/contributions?${qs}` : '/admin/contributions';
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-bold">Toutes les contributions</h1>
      <p className="mt-1 text-sm text-slate-600">
        Gérez et vérifiez les documents soumis.
      </p>

      {/* Filtres */}
      <form className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" method="get">
        <select name="status" defaultValue={searchParams.status ?? ''} className="input">
          {STATUS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select name="exam" defaultValue={searchParams.exam ?? ''} className="input">
          <option value="">Tous les examens</option>
          {(exams ?? []).map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <select name="subject" defaultValue={searchParams.subject ?? ''} className="input">
          <option value="">Toutes les matières</option>
          {(subjects ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="year"
          defaultValue={searchParams.year ?? ''}
          placeholder="Année"
          className="input"
        />
        <button type="submit" className="col-span-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white sm:col-span-1">
          Filtrer
        </button>
        <Link
          href={buildHref({ sort: searchParams.sort === 'ancien' ? 'recent' : 'ancien' })}
          className="col-span-2 flex items-center justify-center rounded-md bg-slate-200 px-4 py-2 text-sm font-medium sm:col-span-1"
        >
          Tri : {searchParams.sort === 'ancien' ? 'plus ancien' : 'plus récent'}
        </Link>
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Sujet</th>
              <th className="px-4 py-3">Année</th>
              <th className="px-4 py-3">Matière</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {(contributions ?? []).map((c: any) => (
              <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-400">#{c.id.slice(0, 4)}</td>
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/contributions/${c.id}`} className="hover:underline">
                    {c.exams?.name} {c.subjects?.name}
                  </Link>
                </td>
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
            {(!contributions || contributions.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Aucune contribution ne correspond aux filtres.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`.input { border: 1px solid #cbd5e1; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; }`}</style>
    </main>
  );
}
