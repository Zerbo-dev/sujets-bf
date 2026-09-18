import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { createClient } from '@/lib/supabase/server';
import { GoogleDriveProvider } from '@/lib/storage/GoogleDriveProvider';
import { StatusBadge } from '@/components/StatusBadge';
import AdminActionButtons from '@/components/AdminActionButtons';

export default async function AdminContributionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();
  const supabase = createClient();

  const { data: contribution } = await supabase
    .from('contributions')
    .select(
      `id, title, description, source, year, session, status, admin_message,
       original_filename, storage_file_id, checksum, exam_id, series_id, subject_id, submitted_at,
       exams(name), series(name), subjects(name), profiles(display_name)`
    )
    .eq('id', params.id)
    .single();

  if (!contribution) notFound();
  const c: any = contribution;

  const { data: history } = await supabase
    .from('validation_history')
    .select('id, old_status, new_status, comment, created_at, profiles(display_name)')
    .eq('contribution_id', params.id)
    .order('created_at', { ascending: false });

  // --- Détection de doublons : alerte l'admin uniquement, ne bloque jamais rien (§20, §21) ---
  const [{ data: sameFile }, { data: sameSubject }] = await Promise.all([
    supabase
      .from('contributions')
      .select('id, title')
      .eq('checksum', c.checksum)
      .neq('id', c.id)
      .limit(5),
    supabase
      .from('contributions')
      .select('id, title')
      .eq('exam_id', c.exam_id)
      .eq('subject_id', c.subject_id)
      .eq('year', c.year)
      .eq('session', c.session)
      .is('series_id', c.series_id)
      .neq('id', c.id)
      .limit(5),
  ]);

  let fileUrl: string | null = null;
  try {
    const storage = new GoogleDriveProvider();
    fileUrl = await storage.getAccessUrl(c.storage_file_id);
  } catch (err) {
    console.error('Erreur récupération lien Drive:', err);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/admin/contributions" className="text-sm text-slate-500">
        ← Retour
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Détails de la contribution</h1>
        <StatusBadge status={c.status} />
      </div>

      {((sameFile && sameFile.length > 0) || (sameSubject && sameSubject.length > 0)) && (
        <div className="mt-4 space-y-1 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {sameFile && sameFile.length > 0 && (
            <p>
              ⚠️ Ce fichier (empreinte identique) a déjà été envoyé{' '}
              {sameFile.length > 1 ? `${sameFile.length} fois` : 'une fois'} auparavant.
            </p>
          )}
          {sameSubject && sameSubject.length > 0 && (
            <p>
              ⚠️ Un sujet {c.exams?.name} {c.series?.name ?? ''} {c.subjects?.name} {c.year}{' '}
              ({c.session}) existe déjà dans les archives.
            </p>
          )}
          <p className="text-xs text-amber-700">
            Ceci est une simple alerte — la contribution n'est ni bloquée ni refusée automatiquement.
          </p>
        </div>
      )}

      <section className="mt-4 grid grid-cols-2 gap-y-3 rounded-lg border border-slate-200 bg-white p-5 text-sm">
        <h2 className="col-span-2 mb-1 font-semibold">Informations</h2>
        <dt className="text-slate-500">Contributeur</dt>
        <dd>{c.profiles?.display_name}</dd>
        <dt className="text-slate-500">Examen</dt>
        <dd>{c.exams?.name}</dd>
        <dt className="text-slate-500">Année</dt>
        <dd>{c.year}</dd>
        <dt className="text-slate-500">Série</dt>
        <dd>{c.series?.name ?? 'Non applicable'}</dd>
        <dt className="text-slate-500">Matière</dt>
        <dd>{c.subjects?.name}</dd>
        <dt className="text-slate-500">Session</dt>
        <dd>{c.session}</dd>
        <dt className="text-slate-500">Titre</dt>
        <dd>{c.title}</dd>
        <dt className="text-slate-500">Source</dt>
        <dd>{c.source || '—'}</dd>
        <dt className="text-slate-500">Description</dt>
        <dd>{c.description || '—'}</dd>
      </section>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-5 text-sm">
        <h2 className="mb-2 font-semibold">Fichier</h2>
        <div className="flex items-center justify-between">
          <span>{c.original_filename}</span>
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white"
            >
              Ouvrir ↗
            </a>
          )}
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold">Actions</h2>
        <AdminActionButtons contributionId={c.id} />
      </section>

      {history && history.length > 0 && (
        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-5 text-sm">
          <h2 className="mb-3 font-semibold">Historique</h2>
          <ul className="space-y-2">
            {history.map((h: any) => (
              <li key={h.id} className="border-l-2 border-slate-200 pl-3">
                <div className="text-slate-500">
                  {new Date(h.created_at).toLocaleString('fr-FR')} — {h.profiles?.display_name ?? 'Admin'}
                </div>
                <div>
                  {h.old_status ?? '—'} → <strong>{h.new_status}</strong>
                  {h.comment && <span className="text-slate-600"> — {h.comment}</span>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
