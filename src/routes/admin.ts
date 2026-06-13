import { Router } from 'express';
import { prisma } from '../prisma/client';
import { authenticate, requireRole } from '../middleware/auth';
import { sendModerationEmail } from '../services/emailService';
import { notificationService } from '../services/notificationService';
import { scrapeAllSources } from '../services/scraperService';

const router = Router();

router.post('/scrape', async (_req, res) => {
  try {
    await scrapeAllSources();
    const total = await prisma.call.count({ where: { source: { not: null } } });
    res.json({ success: true, message: 'Scraping termine', totalScraped: total });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

router.use(authenticate, requireRole('admin'));

export default router;