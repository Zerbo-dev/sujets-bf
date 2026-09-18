import { requireUser } from '@/lib/auth/requireAdmin';
import { createClient } from '@/lib/supabase/server';
import ContributeForm from '@/components/ContributeForm';

export default async function ContribuerPage() {
  await requireUser();
  const supabase = createClient();

  const [{ data: exams }, { data: series }, { data: subjects }] = await Promise.all([
    supabase.from('exams').select('*').eq('active', true).order('name'),
    supabase.from('series').select('*').eq('active', true).order('name'),
    supabase.from('subjects').select('*').eq('active', true).order('name'),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold">Contribuer</h1>
      <p className="mt-1 text-slate-600">
        Envoyez un ancien sujet CEP, BEPC ou BAC en 3 étapes.
      </p>

      <div className="mt-6">
        <ContributeForm exams={exams ?? []} series={series ?? []} subjects={subjects ?? []} />
      </div>
    </main>
  );
}
