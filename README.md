# Sujets BF — Phase 1 (Collecte & Validation)

Scaffold P0 : infrastructure Next.js + Supabase + abstraction de stockage
Google Drive, prêt pour développer P1 (formulaire de contribution).

## 1. Installer les dépendances

```bash
npm install
```

## 2. Créer le projet Supabase

1. Créer un projet sur https://supabase.com (plan gratuit).
2. Dans **SQL Editor**, exécuter tout `supabase/schema.sql`.
3. Dans **Project Settings → API**, copier :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ ne jamais exposer côté client)

## 3. Créer le compte de service Google Drive

1. Sur https://console.cloud.google.com, créer un projet puis activer
   l'**API Google Drive**.
2. Créer un **compte de service**, générer une clé JSON.
3. Créer dans votre Drive personnel le dossier racine
   `Bibliothèque scolaire Burkina`, puis les 4 sous-dossiers :
   `00_A_VALIDER`, `01_VALIDES`, `02_A_CORRIGER`, `03_REFUSES`.
4. **Partager chacun de ces 4 dossiers** (accès "Éditeur") avec l'email du
   compte de service (ex : `xxx@xxx.iam.gserviceaccount.com`).
5. Copier l'ID de chaque dossier (dans l'URL Drive) dans les variables
   `GDRIVE_FOLDER_A_VALIDER`, `GDRIVE_FOLDER_VALIDES`,
   `GDRIVE_FOLDER_A_CORRIGER`, `GDRIVE_FOLDER_REFUSES` (à ajouter à
   `.env.local`, en plus de celles listées dans `.env.example`).

## 4. Variables d'environnement

```bash
cp .env.example .env.local
# puis remplir les valeurs obtenues aux étapes 2 et 3
```

## 5. Lancer en local

```bash
npm run dev
```

## 6. Créer le premier compte admin

1. S'inscrire normalement sur `/inscription` (le rôle par défaut est `user`).
2. Dans Supabase → SQL Editor :
   ```sql
   update public.profiles set role = 'admin' where id = '<uuid-du-compte>';
   ```

## 7. Déployer sur Vercel (plan gratuit)

1. Pousser ce dossier sur GitHub.
2. Importer le repo sur https://vercel.com (plan Hobby = gratuit).
3. Ajouter les mêmes variables d'environnement que `.env.local` dans
   **Project Settings → Environment Variables**.
4. Déployer. Le plan gratuit Vercel est largement suffisant : aucun fichier
   scolaire n'est stocké sur Vercel (tout part vers Google Drive), donc pas
   de risque de dépasser les quotas de stockage/bande passante.

## État d'avancement

- [x] **P0 — Infrastructure** : Next.js, TypeScript, Supabase (schéma + RLS
      + rôles), middleware de session, abstraction `StorageProvider` +
      `GoogleDriveProvider`, pages connexion/inscription.
- [x] **P1 — Collecte** : formulaire de contribution en 3 étapes
      (`/contribuer`), validation stricte côté serveur (type MIME, taille,
      métadonnées), upload réel vers Drive (dossier `00_A_VALIDER`),
      checksum SHA-256, alertes de doublon (non bloquantes), page
      "Mes contributions" (`/mes-contributions`) listant les contributions
      de l'utilisateur avec leur statut.
- [x] **P2 — Administration** : dashboard (`/admin`), liste filtrable
      (`/admin/contributions` : statut, examen, matière, année, tri),
      page de vérification (`/admin/contributions/[id]`) avec accès au
      fichier, actions valider/demander correction/refuser (déplacement
      automatique du fichier vers le bon dossier Drive + historique).
- [x] **P3 — Qualité** : historique global (`/admin/historique`), gestion
      des catégories (`/admin/categories` : ajout et activation/désactivation
      d'examens, séries, matières), alerte de doublon (fichier identique par
      checksum + sujet équivalent) affichée à l'administrateur sur la page
      de vérification — non bloquante, comme exigé.

Le MVP de la phase 1 (collecte → validation) couvre maintenant l'intégralité
du cahier des charges (P0 à P3). Prochaines étapes naturelles, hors phase 1 :
tests automatisés, génération des types Supabase (`supabase gen types`),
et — plus tard — la phase 2 (bibliothèque publique) qui réutilisera les
contributions au statut `approved`.
"# sujets-bf" 
"# sujets-bf" 
