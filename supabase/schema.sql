-- ============================================================
-- Sujets BF — Schéma Supabase (Phase 1 : collecte & validation)
-- À exécuter dans l'éditeur SQL de Supabase, dans cet ordre.
-- ============================================================

-- ------------------------------------------------------------
-- 0. Types énumérés
-- ------------------------------------------------------------
create type public.user_role as enum ('user', 'admin');

create type public.contribution_status as enum (
  'pending',
  'reviewing',
  'needs_correction',
  'approved',
  'rejected',
  'archived'
);

-- ------------------------------------------------------------
-- 1. profiles
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now()
);

-- Crée automatiquement un profil à l'inscription (rôle "user" par défaut).
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- 2. Catégories : exams / series / subjects
-- ------------------------------------------------------------
create table public.exams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  active boolean not null default true
);

create table public.series (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  name text not null,
  slug text not null,
  active boolean not null default true,
  unique (exam_id, slug)
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  active boolean not null default true
);

-- Données de départ (CEP, BEPC, BAC — aucun concours, cf. §4)
insert into public.exams (name, slug) values
  ('CEP', 'cep'),
  ('BEPC', 'bepc'),
  ('BAC', 'bac');

insert into public.subjects (name, slug) values
  ('Mathématiques', 'mathematiques'),
  ('Français', 'francais'),
  ('Physique-Chimie', 'physique-chimie'),
  ('Anglais', 'anglais'),
  ('SVT', 'svt'),
  ('Histoire-Géographie', 'histoire-geographie'),
  ('Philosophie', 'philosophie');

-- Séries pour le BAC (à ajuster : A, C, D, etc.)
insert into public.series (exam_id, name, slug)
select id, s.name, s.slug from public.exams, (values
  ('Série A', 'serie-a'),
  ('Série C', 'serie-c'),
  ('Série D', 'serie-d')
) as s(name, slug)
where exams.slug = 'bac';

-- ------------------------------------------------------------
-- 3. contributions
-- ------------------------------------------------------------
create table public.contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,

  exam_id uuid not null references public.exams(id),
  series_id uuid references public.series(id), -- nullable : "Non applicable" pour CEP/BEPC
  subject_id uuid not null references public.subjects(id),

  year int not null check (year between 1960 and 2100),
  session text not null default 'non_precisee'
    check (session in ('normale', 'remplacement', 'rattrapage', 'autre', 'non_precisee')),

  title text not null,
  description text,
  source text,

  status public.contribution_status not null default 'pending',

  original_filename text not null,
  mime_type text not null check (mime_type in (
    'application/pdf', 'image/jpeg', 'image/jpg', 'image/png'
  )),
  file_size bigint not null,
  checksum text not null, -- sha256 du fichier, pour la détection de doublons stricts (§21)

  storage_provider text not null default 'google_drive',
  storage_file_id text not null, -- ID du fichier chez le provider de stockage

  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  admin_message text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_contributions_user on public.contributions(user_id);
create index idx_contributions_status on public.contributions(status);
create index idx_contributions_checksum on public.contributions(checksum);
create index idx_contributions_dedup on public.contributions(exam_id, series_id, subject_id, year, session);

create function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger contributions_set_updated_at
  before update on public.contributions
  for each row execute procedure public.set_updated_at();

-- ------------------------------------------------------------
-- 4. validation_history
-- ------------------------------------------------------------
create table public.validation_history (
  id uuid primary key default gen_random_uuid(),
  contribution_id uuid not null references public.contributions(id) on delete cascade,
  admin_id uuid references public.profiles(id),
  old_status public.contribution_status,
  new_status public.contribution_status not null,
  comment text,
  created_at timestamptz not null default now()
);

create index idx_validation_history_contribution on public.validation_history(contribution_id);

-- ============================================================
-- 5. Row Level Security (§23)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.exams enable row level security;
alter table public.series enable row level security;
alter table public.subjects enable row level security;
alter table public.contributions enable row level security;
alter table public.validation_history enable row level security;

-- Fonction utilitaire : l'utilisateur courant est-il admin ?
-- security definer pour éviter la récursion RLS sur profiles.
create function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer set search_path = public stable;

-- profiles : chacun voit et modifie son propre profil ; les admins voient tout
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- exams / series / subjects : lecture publique (nécessaire pour le formulaire), écriture admin only
create policy "categories_select_all" on public.exams for select using (true);
create policy "categories_select_all" on public.series for select using (true);
create policy "categories_select_all" on public.subjects for select using (true);

create policy "categories_write_admin" on public.exams
  for all using (public.is_admin()) with check (public.is_admin());
create policy "categories_write_admin" on public.series
  for all using (public.is_admin()) with check (public.is_admin());
create policy "categories_write_admin" on public.subjects
  for all using (public.is_admin()) with check (public.is_admin());

-- contributions : un utilisateur ne voit/modifie que les siennes ; les admins voient/modifient tout
create policy "contributions_select_own_or_admin" on public.contributions
  for select using (user_id = auth.uid() or public.is_admin());

create policy "contributions_insert_own" on public.contributions
  for insert with check (user_id = auth.uid());

-- L'utilisateur peut modifier sa contribution UNIQUEMENT si elle est "needs_correction" (§15)
-- et sans pouvoir changer le statut lui-même.
create policy "contributions_update_own_correction" on public.contributions
  for update using (user_id = auth.uid() and status = 'needs_correction')
  with check (user_id = auth.uid());

-- Seul un admin peut changer le statut librement (validation, refus, etc.)
create policy "contributions_update_admin" on public.contributions
  for all using (public.is_admin()) with check (public.is_admin());

-- validation_history : visible par le propriétaire de la contribution et les admins ;
-- écriture réservée aux admins (via Route Handler avec service role, cf. lib/supabase/server.ts)
create policy "validation_history_select" on public.validation_history
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.contributions c
      where c.id = contribution_id and c.user_id = auth.uid()
    )
  );

create policy "validation_history_write_admin" on public.validation_history
  for insert with check (public.is_admin());

-- ============================================================
-- Note : le rôle "admin" ne doit JAMAIS être attribué automatiquement.
-- Pour promouvoir un premier compte admin, exécuter manuellement en SQL :
--   update public.profiles set role = 'admin' where id = '<uuid-utilisateur>';
-- ============================================================
