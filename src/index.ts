// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// backend/src/index.ts â€” Point d'entrÃ©e du serveur
// ResearchCall MVP â€” Phase 1
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
import adminRoutes from './routes/admin';

// â”€â”€â”€ Configuration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// â”€â”€â”€ Middlewares globaux â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// â”€â”€â”€ Servir les fichiers uploadÃ©s â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// â”€â”€â”€ Health check â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// â”€â”€â”€ Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api', attachmentsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);

// â”€â”€â”€ Domaines & catÃ©gories (donnÃ©es statiques) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.get('/api/domains', (_req, res) => {
  res.json([
    'Intelligence Artificielle', 'Droit International', 'Biologie MolÃ©culaire',
    "Sciences de l'Information et de la Communication", 'Marketing Digital',
    'Ã‰conomie du DÃ©veloppement', 'Linguistique', 'Sociologie', 'Physique',
    'Gestion des Ressources Humaines', 'Communication', 'Sciences Politiques',
    'Informatique', 'MathÃ©matiques', "Sciences de l'Ã‰ducation", 'GÃ©ographie',
    'Histoire', 'Philosophie', 'Psychologie', 'Agronomie', 'MÃ©decine',
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

// â”€â”€â”€ Gestion des erreurs globale â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('âŒ Error:', err);

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

// â”€â”€â”€ DÃ©marrage du serveur â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { startScheduler } from './services/scheduler';

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`
  ðŸ”¬ ResearchCall API
  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  âœ… Serveur dÃ©marrÃ© sur http://localhost:${PORT}
  ðŸ“š API: http://localhost:${PORT}/api
  ðŸ¥ Health: http://localhost:${PORT}/api/health
  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  `);

  // DÃ©marrer les tÃ¢ches planifiÃ©es
  startScheduler();
});

export default app;