'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { createClient } from '@/lib/supabase/server';

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function addExam(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return;

  const supabase = createClient();
  await supabase.from('exams').insert({ name, slug: slugify(name) });
  revalidatePath('/admin/categories');
}

export async function addSubject(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return;

  const supabase = createClient();
  await supabase.from('subjects').insert({ name, slug: slugify(name) });
  revalidatePath('/admin/categories');
}

export async function addSeries(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get('name') ?? '').trim();
  const examId = String(formData.get('exam_id') ?? '');
  if (!name || !examId) return;

  const supabase = createClient();
  await supabase.from('series').insert({ name, slug: slugify(name), exam_id: examId });
  revalidatePath('/admin/categories');
}

export async function toggleActive(
  table: 'exams' | 'series' | 'subjects',
  id: string,
  active: boolean
) {
  await requireAdmin();
  const supabase = createClient();
  await supabase.from(table).update({ active: !active }).eq('id', id);
  revalidatePath('/admin/categories');
}
