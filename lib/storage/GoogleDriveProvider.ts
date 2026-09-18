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

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
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
    const file = await drive.files.get({ fileId, fields: 'parents' });
    const previousParents = (file.data.parents ?? []).join(',');

    await drive.files.update({
      fileId,
      addParents: FOLDER_ENV_MAP[toFolder],
      removeParents: previousParents,
      fields: 'id, parents',
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
    });
  }

  async getMetadata(fileId: string): Promise<FileMetadata> {
    const drive = getDrive();
    const res = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, createdTime',
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
