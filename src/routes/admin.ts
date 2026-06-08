import { Router } from 'express';
import { prisma } from '../prisma/client';
import { authenticate, requireRole } from '../middleware/auth';
import { sendModerationEmail } from '../services/emailService';
import { notificationService } from '../services/notificationService';

const router = Router();

// All admin routes require auth + admin role
router.use(authenticate, requireRole('admin'));

// â”€â”€â”€ Dashboard stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

router.get('/stats', async (_req, res) => {
  const [totalUsers, totalCalls, pendingCalls, totalNotifications] = await Promise.all([
    prisma.user.count(),
    prisma.call.count(),
    prisma.call.count({ where: { status: 'pending' } }),
    prisma.notification.count(),
  ]);

  const usersByRole = await prisma.user.groupBy({ by: ['role'], _count: true });
  const callsByType = await prisma.call.groupBy({ by: ['type'], _count: true, where: { status: 'published' } });
  const callsByStatus = await prisma.call.groupBy({ by: ['status'], _count: true });
  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, firstName: true, lastName: true, email: true, role: true, institution: true, createdAt: true },
  });

  res.json({
    totals: { users: totalUsers, calls: totalCalls, pending: pendingCalls, notifications: totalNotifications },
    usersByRole: Object.fromEntries(usersByRole.map((r) => [r.role, r._count])),
    callsByType: Object.fromEntries(callsByType.map((r) => [r.type, r._count])),
    callsByStatus: Object.fromEntries(callsByStatus.map((r) => [r.status, r._count])),
    recentUsers,
  });
});

// â”€â”€â”€ Pending calls (moderation queue) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

router.get('/calls/pending', async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);

  const [data, total] = await Promise.all([
    prisma.call.findMany({
      where: { status: 'pending' },
      include: { publisher: { select: { firstName: true, lastName: true, email: true, institution: true } } },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.call.count({ where: { status: 'pending' } }),
  ]);

  res.json({ data, total, page, limit, hasMore: page * limit < total });
});

// â”€â”€â”€ Approve / reject a call â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

router.put('/calls/:id/approve', async (req, res) => {
  const call = await prisma.call.findUnique({
    where: { id: req.params.id },
    include: { publisher: { select: { email: true, firstName: true } } },
  });
  if (!call) return res.status(404).json({ error: true, message: 'Appel introuvable' });

  const updated = await prisma.call.update({
    where: { id: req.params.id },
    data: { status: 'published' },
  });

  // Notify publisher
  await notificationService.notifyModerationResult(call.id, true);
  await sendModerationEmail(call.publisher.email, call.publisher.firstName, call.title, true);

  // Trigger push to matching researchers
  notificationService.notifyNewCall(call.id).catch(console.error);

  res.json(updated);
});

router.put('/calls/:id/reject', async (req, res) => {
  const { reason } = req.body as { reason?: string };

  const call = await prisma.call.findUnique({
    where: { id: req.params.id },
    include: { publisher: { select: { email: true, firstName: true } } },
  });
  if (!call) return res.status(404).json({ error: true, message: 'Appel introuvable' });

  const updated = await prisma.call.update({
    where: { id: req.params.id },
    data: { status: 'rejected' },
  });

  await notificationService.notifyModerationResult(call.id, false);
  await sendModerationEmail(call.publisher.email, call.publisher.firstName, call.title, false, reason);

  res.json(updated);
});

// â”€â”€â”€ User management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

router.get('/users', async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 50);
  const q = req.query.q as string | undefined;

  const where = q
    ? {
        OR: [
          { email: { contains: q, mode: 'insensitive' as const } },
          { firstName: { contains: q, mode: 'insensitive' as const } },
          { lastName: { contains: q, mode: 'insensitive' as const } },
          { institution: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, institution: true, domains: true, createdAt: true,
        _count: { select: { publishedCalls: true, favorites: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ data, total, page, limit });
});

router.put('/users/:id/role', async (req, res) => {
  const { role } = req.body as { role: string };
  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: role as any },
    select: { id: true, email: true, role: true },
  });
  res.json(updated);
});

export default router;