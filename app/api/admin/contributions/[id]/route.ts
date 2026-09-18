import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminOrError } from '@/lib/auth/adminGuard';
import { GoogleDriveProvider } from '@/lib/storage/GoogleDriveProvider';
import type { StorageFolder } from '@/lib/storage/StorageProvider';
import type { ContributionStatus } from '@/types/database';

const actionSchema = z.object({
  action: z.enum(['approve', 'needs_correction', 'reject']),
  comment: z.string().trim().max(1000).optional(),
});

const ACTION_CONFIG: Record<
  'approve' | 'needs_correction' | 'reject',
  { newStatus: ContributionStatus; folder: StorageFolder; requiresComment: boolean }
> = {
  approve: { newStatus: 'approved', folder: 'VALIDES', requiresComment: false },
  needs_correction: { newStatus: 'needs_correction', folder: 'A_CORRIGER', requiresComment: true },
  reject: { newStatus: 'rejected', folder: 'REFUSES', requiresComment: true },
};

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const guard = await getAdminOrError();
  if ('error' in guard) return guard.error;
  const { user, supabase } = guard;

  const body = await request.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }
  const { action, comment } = parsed.data;
  const config = ACTION_CONFIG[action];

  if (config.requiresComment && !comment) {
    return NextResponse.json(
      { error: 'Un message est requis pour cette action.' },
      { status: 400 }
    );
  }

  const { data: contribution, error: fetchError } = await supabase
    .from('contributions')
    .select('id, status, storage_file_id')
    .eq('id', params.id)
    .single();

  if (fetchError || !contribution) {
    return NextResponse.json({ error: 'Contribution introuvable.' }, { status: 404 });
  }

  // --- Déplacement du fichier dans le bon dossier Drive (§18) ---
  try {
    const storage = new GoogleDriveProvider();
    await storage.move(contribution.storage_file_id, config.folder);
  } catch (err) {
    console.error('Erreur déplacement Google Drive:', err);
    return NextResponse.json(
      { error: 'Échec du déplacement du fichier sur le stockage.' },
      { status: 502 }
    );
  }

  const oldStatus = contribution.status as ContributionStatus;

  // --- Mise à jour du statut (protégée par RLS : admin uniquement) ---
  const { error: updateError } = await supabase
    .from('contributions')
    .update({
      status: config.newStatus,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      admin_message: comment ?? null,
    })
    .eq('id', params.id);

  if (updateError) {
    console.error('Erreur mise à jour contribution:', updateError);
    return NextResponse.json({ error: 'Échec de la mise à jour du statut.' }, { status: 500 });
  }

  // --- Historique (§19) ---
  const { error: historyError } = await supabase.from('validation_history').insert({
    contribution_id: params.id,
    admin_id: user.id,
    old_status: oldStatus,
    new_status: config.newStatus,
    comment: comment ?? null,
  });

  if (historyError) {
    console.error("Erreur enregistrement de l'historique:", historyError);
    // Non bloquant pour l'utilisateur : le statut a déjà changé.
  }

  return NextResponse.json({ status: config.newStatus });
}
