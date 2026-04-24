// ─────────────────────────────────────────────────────────
// backend/src/routes/attachments.ts — Routes pièces jointes
// ResearchCall MVP — Phase 4
// ─────────────────────────────────────────────────────────

import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { uploadMultiple } from '../middleware/upload';
import { uploadFiles, deleteFile } from '../services/storageService';

const router = Router();
const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════
// POST /api/calls/:id/attachments — Upload fichier(s) joint(s)
// ═══════════════════════════════════════════════════════════

router.post(
  '/calls/:id/attachments',
  authenticate,
  (req, res, next) => {
    uploadMultiple(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(413).json({ error: true, message: 'Fichier trop volumineux (max 10 Mo)' });
          return;
        }
        res.status(400).json({ error: true, message: err.message });
        return;
      }
      next();
    });
  },
  async (req: AuthRequest, res: Response) => {
    try {
      const { id: callId } = req.params;

      // Vérifier que l'appel existe et appartient à l'utilisateur
      const call = await prisma.call.findUnique({
        where: { id: callId },
        select: { publisherId: true },
      });

      if (!call) {
        res.status(404).json({ error: true, message: 'Appel introuvable' });
        return;
      }
      if (call.publisherId !== req.user!.userId) {
        res.status(403).json({ error: true, message: 'Non autorisé' });
        return;
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: true, message: 'Aucun fichier fourni' });
        return;
      }

      // Vérifier le nombre total de fichiers
      const existingCount = await prisma.attachment.count({ where: { callId } });
      if (existingCount + files.length > 5) {
        res.status(400).json({ error: true, message: 'Maximum 5 fichiers par appel' });
        return;
      }

      // Upload et enregistrement en BDD
      const uploadResults = await uploadFiles(files);

      const attachments = await prisma.attachment.createManyAndReturn({
        data: uploadResults.map((result) => ({
          callId,
          fileName: result.fileName,
          fileUrl: result.fileUrl,
          fileSize: result.fileSize,
          mimeType: result.mimeType,
        })),
      });

      res.status(201).json(attachments);
    } catch (error) {
      console.error('Upload attachments error:', error);
      res.status(500).json({ error: true, message: 'Erreur serveur' });
    }
  },
);

// ═══════════════════════════════════════════════════════════
// GET /api/calls/:id/attachments — Liste des fichiers joints
// ═══════════════════════════════════════════════════════════

router.get('/calls/:id/attachments', async (req, res) => {
  try {
    const attachments = await prisma.attachment.findMany({
      where: { callId: req.params.id },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        fileSize: true,
        mimeType: true,
        createdAt: true,
      },
    });
    res.json(attachments);
  } catch (error) {
    console.error('List attachments error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// GET /api/attachments/:id/download — Télécharger un fichier
// ═══════════════════════════════════════════════════════════

router.get('/attachments/:id/download', async (req, res) => {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: req.params.id },
    });

    if (!attachment) {
      res.status(404).json({ error: true, message: 'Fichier introuvable' });
      return;
    }

    // Rediriger vers l'URL du fichier
    res.redirect(attachment.fileUrl);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// DELETE /api/attachments/:id — Supprimer un fichier
// ═══════════════════════════════════════════════════════════

router.delete('/attachments/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: req.params.id },
      include: { call: { select: { publisherId: true } } },
    });

    if (!attachment) {
      res.status(404).json({ error: true, message: 'Fichier introuvable' });
      return;
    }
    if (attachment.call.publisherId !== req.user!.userId) {
      res.status(403).json({ error: true, message: 'Non autorisé' });
      return;
    }

    // Supprimer le fichier physique
    await deleteFile(attachment.fileUrl);

    // Supprimer l'entrée en BDD
    await prisma.attachment.delete({ where: { id: req.params.id } });

    res.json({ message: 'Fichier supprimé' });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

export default router;
