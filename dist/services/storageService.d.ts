export interface UploadResult {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
}
/**
 * Upload d'un fichier (mode local pour le MVP)
 * En production : remplacer par Supabase Storage / S3
 */
export declare function uploadFile(file: Express.Multer.File): Promise<UploadResult>;
/**
 * Upload de plusieurs fichiers
 */
export declare function uploadFiles(files: Express.Multer.File[]): Promise<UploadResult[]>;
/**
 * Suppression d'un fichier
 */
export declare function deleteFile(fileUrl: string): Promise<void>;
/**
 * Vérifier si un fichier existe
 */
export declare function fileExists(fileUrl: string): boolean;
//# sourceMappingURL=storageService.d.ts.map