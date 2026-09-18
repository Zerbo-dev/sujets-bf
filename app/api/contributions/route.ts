import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { GoogleDriveProvider } from '@/lib/storage/GoogleDriveProvider';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  contributionMetadataSchema,
} from '@/lib/validation/contribution';

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
  }

  // --- Validation du fichier (§5, §23) ---
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return NextResponse.json(
      { error: 'Format de fichier non autorisé (PDF, JPG, JPEG, PNG uniquement).' },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: `Fichier trop volumineux (limite : ${MAX_FILE_SIZE_BYTES / 1024 / 1024} Mo).` },
      { status: 400 }
    );
  }

  // --- Validation des métadonnées (§6) ---
  const raw = {
    examId: formData.get('examId'),
    seriesId: formData.get('seriesId') || null,
    subjectId: formData.get('subjectId'),
    year: formData.get('year'),
    session: formData.get('session'),
    title: formData.get('title'),
    description: formData.get('description') || null,
    source: formData.get('source') || null,
  };

  const parsed = contributionMetadataSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Métadonnées invalides.', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const metadata = parsed.data;

  // --- Empreinte du fichier (§21) ---
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const checksum = createHash('sha256').update(buffer).digest('hex');

  // Alerte (non bloquante) si un fichier identique existe déjà.
  const { data: existingSameFile } = await supabase
    .from('contributions')
    .select('id')
    .eq('checksum', checksum)
    .limit(1)
    .maybeSingle();

  // Alerte (non bloquante) si un sujet équivalent existe déjà (§20).
  const { data: existingSimilar } = await supabase
    .from('contributions')
    .select('id')
    .eq('exam_id', metadata.examId)
    .eq('subject_id', metadata.subjectId)
    .eq('year', metadata.year)
    .eq('session', metadata.session)
    .is('series_id', metadata.seriesId)
    .limit(1)
    .maybeSingle();

  // --- Upload vers Google Drive, dossier 00_A_VALIDER (§11, §12) ---
  let storageFileId: string;
  try {
    const storage = new GoogleDriveProvider();
    const uploadResult = await storage.upload({
      buffer,
      filename: file.name,
      mimeType: file.type,
      folder: 'A_VALIDER',
    });
    storageFileId = uploadResult.storageFileId;
  } catch (err) {
    console.error('Erreur upload Google Drive:', err);
    return NextResponse.json(
      { error: "Échec de l'envoi du fichier vers le stockage. Réessayez." },
      { status: 502 }
    );
  }

  // --- Enregistrement en base (§11) ---
  const { data: contribution, error: insertError } = await supabase
    .from('contributions')
    .insert({
      user_id: user.id,
      exam_id: metadata.examId,
      series_id: metadata.seriesId,
      subject_id: metadata.subjectId,
      year: metadata.year,
      session: metadata.session,
      title: metadata.title,
      description: metadata.description,
      source: metadata.source,
      status: 'pending',
      original_filename: file.name,
      mime_type: file.type,
      file_size: file.size,
      checksum,
      storage_provider: 'google_drive',
      storage_file_id: storageFileId,
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('Erreur insertion contribution:', insertError);
    return NextResponse.json(
      { error: "Le fichier a été envoyé mais l'enregistrement a échoué. Contactez le support." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: contribution.id,
    warnings: {
      duplicateFile: Boolean(existingSameFile),
      similarSubject: Boolean(existingSimilar),
    },
  });
}
