/**
 * Abstraction du stockage de fichiers (§25 du cahier des charges).
 * Le MVP n'a qu'une implémentation (GoogleDriveProvider), mais toute la
 * logique applicative doit passer par cette interface pour permettre
 * un remplacement futur par un stockage CDN/objet sans réécrire l'app.
 */

export interface UploadResult {
  storageFileId: string;
  webViewLink?: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdTime: string;
}

export interface StorageProvider {
  /** Envoie un fichier dans le dossier donné (ex : 00_A_VALIDER) et retourne son ID. */
  upload(params: {
    buffer: Buffer;
    filename: string;
    mimeType: string;
    folder: StorageFolder;
  }): Promise<UploadResult>;

  /** Déplace un fichier déjà stocké d'un dossier vers un autre (ex : validation). */
  move(fileId: string, toFolder: StorageFolder): Promise<void>;

  /** Archive/supprime un fichier (utilisé pour le statut "archived"). */
  archive(fileId: string): Promise<void>;

  /** Récupère les métadonnées d'un fichier. */
  getMetadata(fileId: string): Promise<FileMetadata>;

  /** Retourne une URL d'accès temporaire ou directe pour affichage/téléchargement (admin uniquement en phase 1). */
  getAccessUrl(fileId: string): Promise<string>;
}

/** Les 4 dossiers du workflow, définis au §12 du cahier des charges. */
export type StorageFolder =
  | 'A_VALIDER'
  | 'VALIDES'
  | 'A_CORRIGER'
  | 'REFUSES';
