"use strict";
// ─────────────────────────────────────────────────────────
// backend/src/services/storageService.ts — Gestion du stockage
// ResearchCall MVP — Phase 4
//
// Abstraction de la couche stockage :
// - Mode développement : stockage local dans /uploads
// - Mode production : Supabase Storage (ou S3)
// ─────────────────────────────────────────────────────────
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = uploadFile;
exports.uploadFiles = uploadFiles;
exports.deleteFile = deleteFile;
exports.fileExists = fileExists;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const UPLOAD_DIR = path_1.default.join(__dirname, '../../uploads');
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
// S'assurer que le dossier uploads existe
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
/**
 * Upload d'un fichier (mode local pour le MVP)
 * En production : remplacer par Supabase Storage / S3
 */
async function uploadFile(file) {
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
async function uploadFiles(files) {
    return Promise.all(files.map(uploadFile));
}
/**
 * Suppression d'un fichier
 */
async function deleteFile(fileUrl) {
    try {
        // Extraire le nom du fichier depuis l'URL
        const fileName = fileUrl.split('/').pop();
        if (!fileName)
            return;
        const filePath = path_1.default.join(UPLOAD_DIR, fileName);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
    }
    catch (error) {
        console.error('Delete file error:', error);
    }
}
/**
 * Vérifier si un fichier existe
 */
function fileExists(fileUrl) {
    const fileName = fileUrl.split('/').pop();
    if (!fileName)
        return false;
    return fs_1.default.existsSync(path_1.default.join(UPLOAD_DIR, fileName));
}
//# sourceMappingURL=storageService.js.map