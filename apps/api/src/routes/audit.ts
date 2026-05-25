import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import prisma from '../config/database'
import { validate } from '../middleware/validate'
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'

const router = Router()

const reviewSchema = z.object({
  status: z.enum(['ACCURATE', 'NEEDS_IMPROVEMENT', 'INCORRECT']),
  feedback: z.string().optional(),
})

router.get('/', authMiddleware, roleMiddleware('TEACHER'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } })
    if (!teacher) throw createError('Profile guru tidak ditemukan', 404)

    const { status } = req.query

    const logs = await prisma.auditLog.findMany({
      where: {
        teacherId: teacher.id,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        message: {
          include: {
            session: {
              include: {
                student: { include: { user: { select: { name: true } } } },
                _count: { select: { messages: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ success: true, data: logs, total: logs.length })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', authMiddleware, roleMiddleware('TEACHER'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const log = await prisma.auditLog.findUnique({
      where: { id: req.params.id },
      include: {
        message: {
          include: {
            session: {
              include: {
                messages: { orderBy: { createdAt: 'asc' } },
                student: { include: { user: { select: { name: true, email: true } } } },
              },
            },
          },
        },
      },
    })

    if (!log) throw createError('Audit log tidak ditemukan', 404)

    res.json({ success: true, data: log })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/:id/review',
  authMiddleware,
  roleMiddleware('TEACHER'),
  validate(reviewSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } })
      if (!teacher) throw createError('Profile guru tidak ditemukan', 404)

      const log = await prisma.auditLog.findUnique({ where: { id: req.params.id } })
      if (!log) throw createError('Audit log tidak ditemukan', 404)
      if (log.teacherId !== teacher.id) throw createError('Akses ditolak', 403)

      const { status, feedback } = req.body

      const updated = await prisma.auditLog.update({
        where: { id: req.params.id },
        data: { status, feedback, auditedAt: new Date() },
      })

      res.json({ success: true, message: 'Review berhasil disimpan', data: updated })
    } catch (err) {
      next(err)
    }
  }
)

export default router