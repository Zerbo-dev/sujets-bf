import { requireAdmin } from '@/lib/auth/requireAdmin';
import { createClient } from '@/lib/supabase/server';
import { addExam, addSubject, addSeries, toggleActive } from './actions';

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const supabase = createClient();

  const [{ data: exams }, { data: series }, { data: subjects }] = await Promise.all([
    supabase.from('exams').select('*').order('name'),
    supabase.from('series').select('*, exams(name)').order('name'),
    supabase.from('subjects').select('*').order('name'),
  ]);

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-2xl font-bold">Catégories</h1>
        <p className="mt-1 text-sm text-slate-600">
          Uniquement CEP, BEPC, BAC en phase 1 — le système reste flexible
          pour ajouter d'autres examens scolaires plus tard (§4).
        </p>
      </div>

      <CategorySection
        title="Examens"
        items={(exams ?? []).map((e) => ({ id: e.id, label: e.name, active: e.active, table: 'exams' as const }))}
        addAction={addExam}
        addPlaceholder="Ex : Concours d'entrée en 6e"
      />

      <CategorySection
        title="Matières"
        items={(subjects ?? []).map((s) => ({ id: s.id, label: s.name, active: s.active, table: 'subjects' as const }))}
        addAction={addSubject}
        addPlaceholder="Ex : Éducation civique"
      />

      <section>
        <h2 className="font-semibold">Séries</h2>
        <form action={addSeries} className="mt-3 flex flex-wrap gap-2">
          <select name="exam_id" required className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">Examen…</option>
            {(exams ?? []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <input
            name="name"
            required
            placeholder="Ex : Série E"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            Ajouter
          </button>
        </form>
        <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {(series ?? []).map((s: any) => (
            <li key={s.id} className="flex items-center justify-between px-4 py-2 text-sm">
              <span>
                {s.name} <span className="text-slate-400">— {s.exams?.name}</span>
              </span>
              <ToggleButton table="series" id={s.id} active={s.active} />
            </li>
          ))}
          {(!series || series.length === 0) && (
            <li className="px-4 py-4 text-sm text-slate-500">Aucune série pour le moment.</li>
          )}
        </ul>
      </section>
    </main>
  );
}

function CategorySection({
  title,
  items,
  addAction,
  addPlaceholder,
}: {
  title: string;
  items: { id: string; label: string; active: boolean; table: 'exams' | 'subjects' }[];
  addAction: (formData: FormData) => void;
  addPlaceholder: string;
}) {
  return (
    <section>
      <h2 className="font-semibold">{title}</h2>
      <form action={addAction} className="mt-3 flex gap-2">
        <input
          name="name"
          required
          placeholder={addPlaceholder}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">
          Ajouter
        </button>
      </form>
      <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between px-4 py-2 text-sm">
            <span className={item.active ? '' : 'text-slate-400 line-through'}>{item.label}</span>
            <ToggleButton table={item.table} id={item.id} active={item.active} />
          </li>
        ))}
        {items.length === 0 && (
          <li className="px-4 py-4 text-sm text-slate-500">Aucun élément pour le moment.</li>
        )}
      </ul>
    </section>
  );
}

function ToggleButton({
  table,
  id,
  active,
}: {
  table: 'exams' | 'series' | 'subjects';
  id: string;
  active: boolean;
}) {
  async function action() {
    'use server';
    await toggleActive(table, id, active);
  }

  return (
    <form action={action}>
      <button
        type="submit"
        className={`rounded-md px-3 py-1 text-xs font-medium ${
          active ? 'bg-slate-200 text-slate-700' : 'bg-green-100 text-green-800'
        }`}
      >
        {active ? 'Désactiver' : 'Activer'}
      </button>
    </form>
  );
}
