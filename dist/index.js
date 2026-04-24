"use strict";
// ─────────────────────────────────────────────────────────
// backend/src/index.ts — Point d'entrée du serveur
// ResearchCall MVP — Phase 1
// ─────────────────────────────────────────────────────────
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const calls_1 = __importDefault(require("./routes/calls"));
const attachments_1 = __importDefault(require("./routes/attachments"));
const favorites_1 = __importDefault(require("./routes/favorites"));
const notifications_1 = __importDefault(require("./routes/notifications"));
// ─── Configuration ───────────────────────────────────────
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// ─── Middlewares globaux ─────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// ─── Servir les fichiers uploadés ────────────────────────
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// ─── Health check ────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/calls', calls_1.default);
app.use('/api', attachments_1.default);
app.use('/api/favorites', favorites_1.default);
app.use('/api/notifications', notifications_1.default);
// ─── Domaines & catégories (données statiques) ──────────
app.get('/api/domains', (_req, res) => {
    res.json([
        'Intelligence Artificielle', 'Droit International', 'Biologie Moléculaire',
        'Sciences de l\'Information et de la Communication', 'Marketing Digital',
        'Économie du Développement', 'Linguistique', 'Sociologie', 'Physique',
        'Gestion des Ressources Humaines', 'Communication', 'Sciences Politiques',
        'Informatique', 'Mathématiques', 'Sciences de l\'Éducation', 'Géographie',
        'Histoire', 'Philosophie', 'Psychologie', 'Agronomie', 'Médecine',
        'Sciences de la Terre', 'Chimie', 'Arts et Culture',
    ]);
});
app.get('/api/call-types', (_req, res) => {
    res.json([
        { value: 'communication', label: 'Communication' },
        { value: 'publication', label: 'Publication' },
        { value: 'colloque', label: 'Colloque' },
        { value: 'projet', label: 'Projet' },
        { value: 'bourse', label: 'Bourse' },
        { value: 'autre', label: 'Autre' },
    ]);
});
// ─── Gestion des erreurs globale ─────────────────────────
app.use((err, _req, res, _next) => {
    console.error('❌ Error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Erreur serveur interne';
    res.status(statusCode).json({
        error: true,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});
// Route 404
app.use((_req, res) => {
    res.status(404).json({ error: true, message: 'Route introuvable' });
});
// ─── Démarrage du serveur ────────────────────────────────
const scheduler_1 = require("./services/scheduler");
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`
  🔬 ResearchCall API
  ───────────────────────
  ✅ Serveur démarré sur http://localhost:${PORT}
  📚 API: http://localhost:${PORT}/api
  🏥 Health: http://localhost:${PORT}/api/health
  ───────────────────────
  `);
    // Démarrer les tâches planifiées
    (0, scheduler_1.startScheduler)();
});
exports.default = app;
//# sourceMappingURL=index.js.map