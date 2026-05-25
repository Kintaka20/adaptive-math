import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import prisma from '../config/database'
import { validate } from '../middleware/validate'
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'
import { hashPassword } from '../utils/hash'

const router = Router()

router.get('/dashboard', authMiddleware, roleMiddleware('ADMIN'), async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalStudents, totalTeachers, totalSchools, totalChapters, totalMaterials, totalQuizzes, totalQuestions, totalClasses, activeToday] =
      await Promise.all([
        prisma.user.count({ where: { isActive: true } }),
        prisma.student.count(),
        prisma.teacher.count(),
        prisma.school.count({ where: { isActive: true } }),
        prisma.chapter.count(),
        prisma.material.count(),
        prisma.quiz.count(),
        prisma.question.count(),
        prisma.classroom.count(),
        prisma.student.count({ where: { lastActiveAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
      ])

    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true, isActive: true },
    })

    const recentAttempts = await prisma.quizAttempt.count({
      where: { submittedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    })

    const pendingTeachers = await prisma.user.findMany({
      where: { role: 'TEACHER', isActive: false },
      include: { teacher: { include: { school: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    res.json({
      success: true,
      data: {
        stats: { totalUsers, totalStudents, totalTeachers, totalSchools, totalChapters, totalMaterials, totalQuizzes, totalQuestions, totalClasses, activeToday, recentAttempts, pendingTeachersCount: pendingTeachers.length },
        recentUsers,
        pendingTeachers
      },
    })
  } catch (err) {
    next(err)
  }
})

router.get('/users', authMiddleware, roleMiddleware('ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role, search, page = '1', limit = '20' } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const where = {
      ...(role ? { role: role as any } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: String(search), mode: 'insensitive' as const } },
              { email: { contains: String(search), mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: { 
          id: true, 
          name: true, 
          email: true, 
          role: true, 
          isActive: true, 
          isSuspended: true, 
          createdAt: true,
          teacher: { select: { nip: true } }
        },
      }),
      prisma.user.count({ where }),
    ])

    res.json({ success: true, data: users, total, page: Number(page), limit: Number(limit) })
  } catch (err) {
    next(err)
  }
})

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
  isSuspended: z.boolean().optional(),
  password: z.string().min(8).optional(),
})

router.put('/users/:id', authMiddleware, roleMiddleware('ADMIN'), validate(updateUserSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { password, ...data } = req.body
    const updateData: any = { ...data }

    if (password) {
      updateData.password = await hashPassword(password)
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, isActive: true, isSuspended: true },
    })

    res.json({ success: true, message: 'User berhasil diupdate', data: user })
  } catch (err) {
    if ((err as any).code === 'P2025') next(createError('User tidak ditemukan', 404))
    else next(err)
  }
})

router.delete('/users/:id', authMiddleware, roleMiddleware('ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.params.id === req.user!.userId) throw createError('Tidak bisa menghapus akun sendiri', 400)

    await prisma.user.delete({
      where: { id: req.params.id }
    })

    res.json({ success: true, message: 'User berhasil dihapus secara permanen' })
  } catch (err) {
    if ((err as any).code === 'P2025') next(createError('User tidak ditemukan', 404))
    else next(err)
  }
})

router.get('/schools', authMiddleware, roleMiddleware('ADMIN'), async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schools = await prisma.school.findMany({
      include: {
        _count: { select: { students: true, teachers: true } },
      },
      orderBy: { name: 'asc' },
    })
    res.json({ success: true, data: schools })
  } catch (err) {
    next(err)
  }
})

router.get('/schools/:id', authMiddleware, roleMiddleware('ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const school = await prisma.school.findUnique({
      where: { id: req.params.id },
      include: {
        students: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true, isActive: true, isSuspended: true, createdAt: true } }
          }
        },
        teachers: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true, isActive: true, isSuspended: true, createdAt: true } }
          }
        }
      }
    })
    
    if (!school) {
      throw createError('Sekolah tidak ditemukan', 404)
    }
    
    res.json({ success: true, data: school })
  } catch (err) {
    next(err)
  }
})

const createSchoolSchema = z.object({
  name: z.string().min(3),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  type: z.enum(['NEGERI', 'SWASTA']).default('NEGERI'),
})

router.post('/schools', authMiddleware, roleMiddleware('ADMIN'), validate(createSchoolSchema), async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const school = await prisma.school.create({ data: _req.body })
    res.status(201).json({ success: true, message: 'Sekolah berhasil ditambahkan', data: school })
  } catch (err) {
    next(err)
  }
})
const updateSchoolSchema = z.object({
  name: z.string().min(3).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  type: z.enum(['NEGERI', 'SWASTA']).optional(),
  isActive: z.boolean().optional(),
})

router.put('/schools/:id', authMiddleware, roleMiddleware('ADMIN'), validate(updateSchoolSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const school = await prisma.school.update({
      where: { id: req.params.id },
      data: req.body
    })
    res.json({ success: true, message: 'Sekolah berhasil diperbarui', data: school })
  } catch (err) {
    next(err)
  }
})

router.delete('/schools/:id', authMiddleware, roleMiddleware('ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.school.delete({
      where: { id: req.params.id }
    })
    res.json({ success: true, message: 'Sekolah berhasil dihapus' })
  } catch (err) {
    next(err)
  }
})

router.get('/classes', authMiddleware, roleMiddleware('ADMIN'), async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const classes = await prisma.classroom.findMany({
      include: {
        teacher: { select: { user: { select: { name: true } } } },
        school: { select: { name: true } },
        _count: { select: { enrollments: true, chapters: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ success: true, data: classes })
  } catch (err) {
    next(err)
  }
})

router.delete('/classes/:id', authMiddleware, roleMiddleware('ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const classId = req.params.id
    const cls = await prisma.classroom.findUnique({ where: { id: classId } })
    if (!cls) throw createError('Kelas tidak ditemukan', 404)

    await prisma.$transaction(async (tx) => {
      await tx.classroomEnrollment.deleteMany({ where: { classroomId: classId } })
      await tx.classroomChapter.deleteMany({ where: { classroomId: classId } })
      await tx.classroom.delete({ where: { id: classId } })
    })

    res.json({ success: true, message: `Kelas "${cls.name}" berhasil dihapus permanen` })
  } catch (err) {
    next(err)
  }
})

router.get('/chapters', authMiddleware, roleMiddleware('ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { grade } = req.query
    const chapters = await prisma.chapter.findMany({
      where: grade ? { grade: grade as any } : {},
      orderBy: [{ grade: 'asc' }, { order: 'asc' }],
      include: {
        _count: { select: { materials: true, quizzes: true } },
      },
    })
    res.json({ success: true, data: chapters })
  } catch (err) {
    next(err)
  }
})

const createChapterSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  grade: z.enum(['X', 'XI', 'XII']),
  order: z.number().int().min(1),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
})

router.post('/chapters', authMiddleware, roleMiddleware('ADMIN'), validate(createChapterSchema), async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const chapter = await prisma.chapter.create({ 
      data: { ..._req.body, isSystem: true } 
    })
    res.status(201).json({ success: true, message: 'Bab berhasil dibuat', data: chapter })
  } catch (err) {
    next(err)
  }
})

const updateChapterSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  grade: z.enum(['X', 'XI', 'XII']).optional(),
  order: z.number().int().min(1).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
})

router.put('/chapters/:id', authMiddleware, roleMiddleware('ADMIN'), validate(updateChapterSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const chapter = await prisma.chapter.update({
      where: { id: req.params.id },
      data: req.body
    })
    res.json({ success: true, message: 'Bab berhasil diperbarui', data: chapter })
  } catch (err) {
    next(err)
  }
})

router.delete('/chapters/:id', authMiddleware, roleMiddleware('ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const chapterId = req.params.id

    const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } })
    if (!chapter) throw createError('Bab tidak ditemukan', 404)

    await prisma.$transaction(async (tx) => {
      await tx.classroomChapter.deleteMany({ where: { chapterId } })

      const materialIds = (await tx.material.findMany({ where: { chapterId }, select: { id: true } })).map(m => m.id)
      if (materialIds.length > 0) {
        await tx.materialProgress.deleteMany({ where: { materialId: { in: materialIds } } })
      }

      await tx.material.deleteMany({ where: { chapterId } })

      const quizIds = (await tx.quiz.findMany({ where: { chapterId }, select: { id: true } })).map(q => q.id)
      if (quizIds.length > 0) {
        const attemptIds = (await tx.quizAttempt.findMany({ where: { quizId: { in: quizIds } }, select: { id: true } })).map(a => a.id)
        if (attemptIds.length > 0) {
          await tx.quizAttemptAnswer.deleteMany({ where: { attemptId: { in: attemptIds } } })
          await tx.quizAttempt.deleteMany({ where: { id: { in: attemptIds } } })
        }
        await tx.quizQuestion.deleteMany({ where: { quizId: { in: quizIds } } })
      }

      await tx.quiz.deleteMany({ where: { chapterId } })

      await tx.question.deleteMany({ where: { chapterId } })

      await tx.chapter.delete({ where: { id: chapterId } })
    })

    res.json({ success: true, message: `Bab "${chapter.name}" berhasil dihapus beserta seluruh kontennya` })
  } catch (err) {
    next(err)
  }
})

router.get('/api-logs', authMiddleware, roleMiddleware('ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = '50' } = req.query

    const logs = await prisma.apiLog.findMany({
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    })

    res.json({ success: true, data: logs })
  } catch (err) {
    next(err)
  }
})

export default router
