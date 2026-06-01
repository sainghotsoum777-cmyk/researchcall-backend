// ─────────────────────────────────────────────────────────
// backend/src/index.ts — Point d'entrée du serveur
// ResearchCall MVP — Phase 1
// ─────────────────────────────────────────────────────────

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import path from 'path';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import callsRoutes from './routes/calls';
import attachmentsRoutes from './routes/attachments';
import favoritesRoutes from './routes/favorites';
import notificationsRoutes from './routes/notifications';

// ─── Configuration ───────────────────────────────────────
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares globaux ─────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Servir les fichiers uploadés ────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Health check ────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api', attachmentsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/notifications', notificationsRoutes);

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
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
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
import { startScheduler } from './services/scheduler';

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
  startScheduler();
});

export default app;
 
