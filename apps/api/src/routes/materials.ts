import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import prisma from '../config/database'
import { validate } from '../middleware/validate'
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'

const router = Router()

const createMaterialSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  content: z.string().min(10, 'Konten minimal 10 karakter'),
  duration: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  pdfUrl: z.string().url().optional().or(z.literal('')),
  chapterId: z.string(),
  order: z.number().int().default(0),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  isSystem: z.boolean().default(false),
})

const updateMaterialSchema = createMaterialSchema.partial()

const progressSchema = z.object({
  progress: z.number().min(0).max(100),
  timeSpent: z.number().min(0),
  isCompleted: z.boolean().optional(),
})

router.get('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { chapterId, status } = req.query

    const materials = await prisma.material.findMany({
      where: {
        ...(chapterId ? { chapterId: String(chapterId) } : {}),
        ...(status ? { status: status as any } : {}),
      },
      orderBy: { order: 'asc' },
      include: {
        chapter: { select: { id: true, name: true, grade: true } },
        createdBy: { select: { user: { select: { name: true } } } },
      },
    })

    res.json({ success: true, data: materials })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const material = await prisma.material.findUnique({
      where: { id: req.params.id },
      include: {
        chapter: { select: { name: true, grade: true } },
      },
    })

    if (!material) throw createError('Materi tidak ditemukan', 404)

    res.json({ success: true, data: material })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/',
  authMiddleware,
  roleMiddleware('TEACHER', 'ADMIN'),
  validate(createMaterialSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = req.body

      let createdById: string | undefined = undefined
      if (req.user!.role === 'TEACHER') {
        const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } })
        if (teacher) createdById = teacher.id
      }

      const material = await prisma.material.create({
        data: {
          ...data,
          createdById,
          isSystem: req.user!.role === 'ADMIN' ? data.isSystem : false,
        },
      })

      res.status(201).json({ success: true, message: 'Materi berhasil dibuat', data: material })
    } catch (err) {
      next(err)
    }
  }
)

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('TEACHER', 'ADMIN'),
  validate(updateMaterialSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const material = await prisma.material.update({
        where: { id: req.params.id },
        data: req.body,
      })

      res.json({ success: true, message: 'Materi berhasil diupdate', data: material })
    } catch (err) {
      if ((err as any).code === 'P2025') {
        next(createError('Materi tidak ditemukan', 404))
      } else {
        next(err)
      }
    }
  }
)

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('TEACHER', 'ADMIN'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await prisma.material.delete({
        where: { id: req.params.id },
      })

      res.json({ success: true, message: 'Materi berhasil dihapus' })
    } catch (err) {
      if ((err as any).code === 'P2025') {
        next(createError('Materi tidak ditemukan', 404))
      } else {
        next(err)
      }
    }
  }
)

router.post(
  '/:id/progress',
  authMiddleware,
  roleMiddleware('STUDENT'),
  validate(progressSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } })
      if (!student) throw createError('Profile siswa tidak ditemukan', 404)

      const materialId = req.params.id
      const { progress, timeSpent, isCompleted } = req.body

      const upserted = await prisma.materialProgress.upsert({
        where: {
          studentId_materialId: {
            studentId: student.id,
            materialId,
          },
        },
        update: {
          progress,
          timeSpent: { increment: timeSpent },
          isCompleted: isCompleted !== undefined ? isCompleted : progress === 100,
          completedAt: isCompleted || progress === 100 ? new Date() : null,
        },
        create: {
          studentId: student.id,
          materialId,
          progress,
          timeSpent,
          isCompleted: isCompleted || progress === 100,
          completedAt: isCompleted || progress === 100 ? new Date() : null,
        },
      })

      res.json({ success: true, message: 'Progress disimpan', data: upserted })
    } catch (err) {
      next(err)
    }
  }
)

export default router
