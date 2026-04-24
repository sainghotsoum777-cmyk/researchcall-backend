"use strict";
// ─────────────────────────────────────────────────────────
// backend/src/middleware/upload.ts — Configuration Multer
// ResearchCall MVP — Phase 1
// ─────────────────────────────────────────────────────────
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatar = exports.uploadMultiple = exports.uploadSingle = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
];
// ─── Stockage temporaire en local (MVP) ──────────────────
// En production, remplacer par Supabase Storage ou S3
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../uploads'));
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    },
});
// ─── Filtre de fichiers ──────────────────────────────────
const fileFilter = (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Type de fichier non autorisé: ${file.mimetype}. Types acceptés: PDF, DOC, DOCX, JPEG, PNG`));
    }
};
// ─── Exports ─────────────────────────────────────────────
exports.uploadSingle = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
}).single('file');
exports.uploadMultiple = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
}).array('files', 5); // Max 5 fichiers
exports.uploadAvatar = (0, multer_1.default)({
    storage,
    fileFilter: (_req, file, cb) => {
        if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Format d\'image non supporté. Utilisez JPEG, PNG ou WebP.'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo pour les avatars
}).single('avatar');
//# sourceMappingURL=upload.js.map