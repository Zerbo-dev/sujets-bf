import { google } from 'googleapis';
import { Readable } from 'stream';
import type {
  StorageProvider,
  StorageFolder,
  UploadResult,
  FileMetadata,
} from './StorageProvider';

/**
 * Implémentation Google Drive de StorageProvider.
 * N'utiliser QUE côté serveur (Route Handlers / Server Actions) — jamais
 * importé dans un composant client. Les identifiants restent dans les
 * variables d'environnement serveur (§24).
 *
 * IMPORTANT — pourquoi OAuth2 et pas un compte de service :
 * Un compte de service Google n'a AUCUN quota de stockage sur "Mon Drive"
 * (erreur `storageQuotaExceeded`, 403). Deux solutions existent :
 *   1. Un Drive partagé ("Shared Drive") — nécessite Google Workspace.
 *   2. OAuth2 "offline" avec un vrai compte Gmail — fonctionne avec un
 *      compte Google gratuit classique, c'est la solution retenue ici.
 * Le compte Gmail choisi doit être propriétaire (ou avoir un accès
 * "Éditeur") du dossier racine "Bibliothèque scolaire Burkina" et de ses
 * 4 sous-dossiers. Voir scripts/get-google-refresh-token.mjs pour obtenir
 * GOOGLE_OAUTH_REFRESH_TOKEN une seule fois.
 */

// Les 4 sous-dossiers doivent être créés une fois manuellement dans le
// dossier racine "Bibliothèque scolaire Burkina" (§12), puis leurs IDs
// collés ici ou chargés dynamiquement — simplifié ici en variables d'env.
const FOLDER_ENV_MAP: Record<StorageFolder, string> = {
  A_VALIDER: process.env.GDRIVE_FOLDER_A_VALIDER!,
  VALIDES: process.env.GDRIVE_FOLDER_VALIDES!,
  A_CORRIGER: process.env.GDRIVE_FOLDER_A_CORRIGER!,
  REFUSES: process.env.GDRIVE_FOLDER_REFUSES!,
};

let cachedAuth: InstanceType<typeof google.auth.OAuth2> | null = null;

function getAuth() {
  if (cachedAuth) return cachedAuth;

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Configuration Google Drive manquante : GOOGLE_OAUTH_CLIENT_ID, " +
        'GOOGLE_OAUTH_CLIENT_SECRET et GOOGLE_OAUTH_REFRESH_TOKEN doivent être ' +
        'définis (voir scripts/get-google-refresh-token.mjs).'
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  cachedAuth = oauth2Client;
  return oauth2Client;
}

function getDrive() {
  return google.drive({ version: 'v3', auth: getAuth() });
}

export class GoogleDriveProvider implements StorageProvider {
  async upload({
    buffer,
    filename,
    mimeType,
    folder,
  }: {
    buffer: Buffer;
    filename: string;
    mimeType: string;
    folder: StorageFolder;
  }): Promise<UploadResult> {
    const drive = getDrive();

    const res = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [FOLDER_ENV_MAP[folder]],
      },
      media: {
        mimeType,
        body: Readable.from(buffer),
      },
      fields: 'id, webViewLink',
      supportsAllDrives: true,
    });

    if (!res.data.id) {
      throw new Error('Échec de l\'upload Google Drive : aucun ID retourné.');
    }

    return {
      storageFileId: res.data.id,
      webViewLink: res.data.webViewLink ?? undefined,
    };
  }

  async move(fileId: string, toFolder: StorageFolder): Promise<void> {
    const drive = getDrive();

    // Il faut connaître le(s) parent(s) actuel(s) pour les retirer.
    const file = await drive.files.get({ fileId, fields: 'parents', supportsAllDrives: true });
    const previousParents = (file.data.parents ?? []).join(',');

    await drive.files.update({
      fileId,
      addParents: FOLDER_ENV_MAP[toFolder],
      removeParents: previousParents,
      fields: 'id, parents',
      supportsAllDrives: true,
    });
  }

  async archive(fileId: string): Promise<void> {
    // Choix : ne pas supprimer définitivement, juste marquer comme archivé
    // via un déplacement logique — la corbeille Drive n'est pas utilisée
    // pour éviter toute perte accidentelle en phase 1.
    const drive = getDrive();
    await drive.files.update({
      fileId,
      requestBody: { trashed: false, description: 'Archivé par Sujets BF' },
      supportsAllDrives: true,
    });
  }

  async getMetadata(fileId: string): Promise<FileMetadata> {
    const drive = getDrive();
    const res = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, createdTime',
      supportsAllDrives: true,
    });

    return {
      id: res.data.id!,
      name: res.data.name!,
      mimeType: res.data.mimeType!,
      size: Number(res.data.size ?? 0),
      createdTime: res.data.createdTime!,
    };
  }

  async getAccessUrl(fileId: string): Promise<string> {
    // Phase 1 : accès réservé à l'administrateur, on renvoie le lien Drive natif.
    return `https://drive.google.com/file/d/${fileId}/view`;
  }
}
