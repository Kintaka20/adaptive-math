import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import prisma from '../config/database'
import { validate } from '../middleware/validate'
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'
import { generateCode } from '../utils/hash'

const router = Router()

const createClassSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  grade: z.enum(['X', 'XI', 'XII']),
  academicYear: z.string().min(9), // e.g. "2025/2026"
  semester: z.number().int().min(1).max(2),
  kkmScore: z.number().int().min(0).max(100).default(70),
  isFinished: z.boolean().optional(),
  autoRemedial: z.boolean().optional().default(true),
})

const updateClassSchema = createClassSchema.partial()

const joinClassSchema = z.object({
  joinCode: z.string().length(6),
})

const assignChaptersSchema = z.object({
  chapterIds: z.array(z.string()).min(1),
})

router.get('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const role = req.user!.role

    if (role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } })
      if (!teacher) throw createError('Profile guru tidak ditemukan', 404)

      const classes = await prisma.classroom.findMany({
        where: { teacherId: teacher.id, isActive: true },
        include: {
          _count: { select: { enrollments: true, chapters: true } },
          school: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return res.json({ success: true, data: classes })
    }

    if (role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } })
      if (!student) throw createError('Profile siswa tidak ditemukan', 404)

      const enrollments = await prisma.classroomEnrollment.findMany({
        where: { studentId: student.id, isActive: true },
        include: {
          classroom: {
            include: {
              teacher: { select: { user: { select: { name: true } } } },
              _count: { select: { chapters: true } },
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      })
      return res.json({ success: true, data: enrollments.map(e => ({ ...e.classroom, joinedAt: e.joinedAt })) })
    }

    const classes = await prisma.classroom.findMany({
      where: { isActive: true },
      include: {
        teacher: { select: { user: { select: { name: true } } } },
        _count: { select: { enrollments: true } },
      },
    })
    res.json({ success: true, data: classes })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/',
  authMiddleware,
  roleMiddleware('TEACHER'),
  validate(createClassSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } })
      if (!teacher) throw createError('Profile guru tidak ditemukan', 404)

      const data = req.body
      const joinCode = generateCode(6) // Generate unique 6-char code

      const newClass = await prisma.classroom.create({
        data: {
          ...data,
          joinCode,
          teacherId: teacher.id,
          schoolId: teacher.schoolId,
        },
      })

      const gradeChapters = await prisma.chapter.findMany({
        where: { grade: data.grade, status: 'PUBLISHED' },
        orderBy: { order: 'asc' },
        select: { id: true },
      })

      if (gradeChapters.length > 0) {
        await prisma.classroomChapter.createMany({
          data: gradeChapters.map((ch, idx) => ({
            classroomId: newClass.id,
            chapterId: ch.id,
            order: idx + 1,
          })),
          skipDuplicates: true,
        })
      }

      res.status(201).json({
        success: true,
        message: `Kelas berhasil dibuat dengan ${gradeChapters.length} bab otomatis`,
        data: newClass,
      })
    } catch (err) {
      if ((err as any).code === 'P2002') {
        next(createError('Gagal membuat kode join unik, silakan coba lagi', 500))
      } else {
        next(err)
      }
    }
  }
)

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cls = await prisma.classroom.findUnique({
      where: { id: req.params.id },
      include: {
        teacher: { select: { user: { select: { name: true } } } },
        chapters: { include: { chapter: { include: { materials: { orderBy: { order: 'asc' } }, quizzes: { orderBy: { order: 'asc' } } } } }, orderBy: { order: 'asc' } },
        _count: { select: { enrollments: true } },
      },
    })

    if (!cls) throw createError('Kelas tidak ditemukan', 404)

    res.json({ success: true, data: cls })
  } catch (err) {
    next(err)
  }
})

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('TEACHER'),
  validate(updateClassSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } })
      
      const existing = await prisma.classroom.findUnique({ where: { id: req.params.id } })
      if (!existing) throw createError('Kelas tidak ditemukan', 404)
      if (existing.teacherId !== teacher?.id) throw createError('Akses ditolak', 403)

      const cls = await prisma.classroom.update({
        where: { id: req.params.id },
        data: req.body,
      })

      res.json({ success: true, message: 'Kelas berhasil diupdate', data: cls })
    } catch (err) {
      next(err)
    }
  }
)

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('TEACHER'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } })
      const existing = await prisma.classroom.findUnique({ where: { id: req.params.id } })
      
      if (!existing) throw createError('Kelas tidak ditemukan', 404)
      if (existing.teacherId !== teacher?.id) throw createError('Akses ditolak', 403)

      await prisma.$transaction(async (tx) => {
        await tx.classroomEnrollment.deleteMany({ where: { classroomId: existing.id } })
        await tx.classroomChapter.deleteMany({ where: { classroomId: existing.id } })
        await tx.classroom.delete({ where: { id: existing.id } })
      })

      res.json({ success: true, message: `Kelas "${existing.name}" berhasil dihapus` })
    } catch (err) {
      next(err)
    }
  }
)

router.post(
  '/join',
  authMiddleware,
  roleMiddleware('STUDENT'),
  validate(joinClassSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } })
      if (!student) throw createError('Profile siswa tidak ditemukan', 404)

      const { joinCode } = req.body

      const cls = await prisma.classroom.findUnique({ where: { joinCode: joinCode.toUpperCase(), isActive: true } })
      if (!cls) throw createError('Kode kelas tidak valid atau kelas sudah tidak aktif', 404)

      const existing = await prisma.classroomEnrollment.findUnique({
        where: { classroomId_studentId: { classroomId: cls.id, studentId: student.id } },
      })

      if (existing) {
        if (!existing.isActive) {
          await prisma.classroomEnrollment.update({
            where: { id: existing.id },
            data: { isActive: true },
          })
          return res.json({ success: true, message: 'Berhasil bergabung kembali ke kelas' })
        }
        throw createError('Anda sudah terdaftar di kelas ini', 400)
      }

      await prisma.classroomEnrollment.create({
        data: {
          classroomId: cls.id,
          studentId: student.id,
        },
      })

      res.status(201).json({ success: true, message: `Berhasil bergabung dengan kelas ${cls.name}` })
    } catch (err) {
      next(err)
    }
  }
)

router.get(
  '/:id/students',
  authMiddleware,
  roleMiddleware('TEACHER'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const enrollments = await prisma.classroomEnrollment.findMany({
        where: { classroomId: req.params.id, isActive: true },
        include: {
          student: {
            include: { user: { select: { name: true, email: true, avatar: true } } },
          },
        },
        orderBy: { joinedAt: 'asc' },
      })

      res.json({ success: true, data: enrollments })
    } catch (err) {
      next(err)
    }
  }
)

router.post(
  '/:id/chapters',
  authMiddleware,
  roleMiddleware('TEACHER'),
  validate(assignChaptersSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } })
      const existingCls = await prisma.classroom.findUnique({ where: { id: req.params.id }, include: { _count: { select: { chapters: true } } } })
      
      if (!existingCls) throw createError('Kelas tidak ditemukan', 404)
      if (existingCls.teacherId !== teacher?.id) throw createError('Akses ditolak', 403)

      const { chapterIds } = req.body
      let currentOrder = existingCls._count.chapters

      const creations = chapterIds.map((cId: string) => ({
        classroomId: req.params.id,
        chapterId: cId,
        order: ++currentOrder,
      }))

      const count = await prisma.$transaction(async (tx) => {
        let added = 0
        for (const c of creations) {
          const exists = await tx.classroomChapter.findUnique({
            where: { classroomId_chapterId: { classroomId: c.classroomId, chapterId: c.chapterId } },
          })
          if (!exists) {
            await tx.classroomChapter.create({ data: c })
            added++
          }
        }
        return added
      })

      res.status(201).json({ success: true, message: `${count} bab berhasil ditambahkan ke kelas` })
    } catch (err) {
      next(err)
    }
  }
)

const createCustomChapterSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional()
})

router.post(
  '/:id/custom-chapter',
  authMiddleware,
  roleMiddleware('TEACHER'),
  validate(createCustomChapterSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } })
      const existingCls = await prisma.classroom.findUnique({ where: { id: req.params.id }, include: { _count: { select: { chapters: true } } } })
      
      if (!existingCls) throw createError('Kelas tidak ditemukan', 404)
      if (existingCls.teacherId !== teacher?.id) throw createError('Akses ditolak', 403)

      const { name, description } = req.body
      let currentOrder = existingCls._count.chapters

      const result = await prisma.$transaction(async (tx) => {
        const newChapter = await tx.chapter.create({
          data: {
            name,
            description,
            grade: existingCls.grade,
            order: currentOrder + 1,
            status: 'PUBLISHED',
            isSystem: false,
            createdById: teacher?.id
          }
        })

        await tx.classroomChapter.create({
          data: {
            classroomId: existingCls.id,
            chapterId: newChapter.id,
            order: currentOrder + 1,
          }
        })

        return newChapter
      })

      res.status(201).json({ success: true, message: 'Bab berhasil dibuat dan ditambahkan ke kelas', data: result })
    } catch (err) {
      next(err)
    }
  }
)

router.delete(
  '/:id/chapters/:chapterId',
  authMiddleware,
  roleMiddleware('TEACHER'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } })
      const existingCls = await prisma.classroom.findUnique({ where: { id: req.params.id } })
      
      if (!existingCls) throw createError('Kelas tidak ditemukan', 404)
      if (existingCls.teacherId !== teacher?.id) throw createError('Akses ditolak', 403)

      const { chapterId } = req.params

      const classChapter = await prisma.classroomChapter.findUnique({
        where: { classroomId_chapterId: { classroomId: existingCls.id, chapterId } }
      })

      if (!classChapter) throw createError('Bab tidak ditemukan di kelas ini', 404)

      const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } })

      await prisma.$transaction(async (tx) => {
        await tx.classroomChapter.delete({
          where: { classroomId_chapterId: { classroomId: existingCls.id, chapterId } }
        })

        if (chapter && !chapter.isSystem && chapter.createdById === teacher?.id) {
          const links = await tx.classroomChapter.count({ where: { chapterId } })
          if (links === 0) {
            await tx.chapter.delete({ where: { id: chapterId } })
          }
        }
      })

      res.json({ success: true, message: 'Bab berhasil dihapus dari kelas' })
    } catch (err) {
      next(err)
    }
  }
)

export default router
