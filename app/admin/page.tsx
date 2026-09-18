import { requireAdmin } from '@/lib/auth/requireAdmin';
import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = createClient();

  const counts = await Promise.all(
    (['pending', 'reviewing', 'needs_correction', 'approved', 'rejected'] as const).map(
      async (status) => {
        const { count } = await supabase
          .from('contributions')
          .select('*', { count: 'exact', head: true })
          .eq('status', status);
        return { status, count: count ?? 0 };
      }
    )
  );

  const labels: Record<string, string> = {
    pending: 'En attente',
    reviewing: 'En vérification',
    needs_correction: 'Corrections demandées',
    approved: 'Validés',
    rejected: 'Refusés',
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        {counts.map(({ status, count }) => (
          <div key={status} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-sm text-slate-600">{labels[status]}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
