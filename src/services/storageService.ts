// ─────────────────────────────────────────────────────────
// backend/src/services/storageService.ts — Gestion du stockage
// ResearchCall MVP — Phase 4
//
// Abstraction de la couche stockage :
// - Mode développement : stockage local dans /uploads
// - Mode production : Supabase Storage (ou S3)
// ─────────────────────────────────────────────────────────

import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// S'assurer que le dossier uploads existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

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
export async function uploadFile(file: Express.Multer.File): Promise<UploadResult> {
  // En mode local, Multer a déjà sauvegardé le fichier
  const fileUrl = `${BASE_URL}/uploads/${file.filename}`;

  return {
    fileUrl,
    fileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
  };
}

/**
 * Upload de plusieurs fichiers
 */
export async function uploadFiles(files: Express.Multer.File[]): Promise<UploadResult[]> {
  return Promise.all(files.map(uploadFile));
}

/**
 * Suppression d'un fichier
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    // Extraire le nom du fichier depuis l'URL
    const fileName = fileUrl.split('/').pop();
    if (!fileName) return;

    const filePath = path.join(UPLOAD_DIR, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Delete file error:', error);
  }
}

/**
 * Vérifier si un fichier existe
 */
export function fileExists(fileUrl: string): boolean {
  const fileName = fileUrl.split('/').pop();
  if (!fileName) return false;
  return fs.existsSync(path.join(UPLOAD_DIR, fileName));
}
