import { z } from 'zod';

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
] as const;

export const SESSIONS = [
  'normale',
  'remplacement',
  'rattrapage',
  'autre',
  'non_precisee',
] as const;

export const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB ?? 10);
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/** Validé côté serveur pour chaque contribution reçue (§5, §6, §23). */
export const contributionMetadataSchema = z.object({
  examId: z.string().uuid(),
  seriesId: z.string().uuid().nullable(), // null = "Non applicable"
  subjectId: z.string().uuid(),
  year: z.coerce
    .number()
    .int()
    .min(1960)
    .max(new Date().getFullYear()),
  session: z.enum(SESSIONS),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(1000).optional().nullable(),
  source: z.string().trim().max(200).optional().nullable(),
});

export type ContributionMetadata = z.infer<typeof contributionMetadataSchema>;
