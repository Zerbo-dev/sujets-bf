// Types minimaux à la main pour démarrer.
// À terme, générer automatiquement avec :
//   npx supabase gen types typescript --project-id <id> > types/database.ts

export type UserRole = 'user' | 'admin';

export type ContributionStatus =
  | 'pending'
  | 'reviewing'
  | 'needs_correction'
  | 'approved'
  | 'rejected'
  | 'archived';

export type Session = 'normale' | 'remplacement' | 'rattrapage' | 'autre' | 'non_precisee';

export interface Profile {
  id: string;
  display_name: string;
  role: UserRole;
  created_at: string;
}

export interface Exam {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

export interface SeriesRow {
  id: string;
  exam_id: string;
  name: string;
  slug: string;
  active: boolean;
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

export interface Contribution {
  id: string;
  user_id: string;
  exam_id: string;
  series_id: string | null;
  subject_id: string;
  year: number;
  session: Session;
  title: string;
  description: string | null;
  source: string | null;
  status: ContributionStatus;
  original_filename: string;
  mime_type: string;
  file_size: number;
  checksum: string;
  storage_provider: string;
  storage_file_id: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ValidationHistoryEntry {
  id: string;
  contribution_id: string;
  admin_id: string | null;
  old_status: ContributionStatus | null;
  new_status: ContributionStatus;
  comment: string | null;
  created_at: string;
}

// Placeholder générique pour satisfaire @supabase/ssr en attendant
// la génération automatique des types depuis le projet Supabase.
export type Database = any;
