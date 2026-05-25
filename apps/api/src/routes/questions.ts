import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import prisma from '../config/database'
import { validate } from '../middleware/validate'
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'

const router = Router()

const optionSchema = z.object({
  id: z.string().optional(),
  label: z.string(),
  text: z.string(),
  isCorrect: z.boolean().default(false),
})

const createQuestionSchema = z.object({
  text: z.string().min(5),
  imageUrl: z.string().url().optional().or(z.literal('')),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  explanation: z.string().optional(),
  chapterId: z.string().optional(),
  grade: z.enum(['X', 'XI', 'XII']).optional(),
  isSystem: z.boolean().default(false),
  options: z.array(optionSchema).min(2).max(5),
})

const updateQuestionSchema = createQuestionSchema.partial()

const importQuestionsSchema = z.object({
  quizId: z.string(),
  questionIds: z.array(z.string()).min(1),
})

router.get('/', authMiddleware, roleMiddleware('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { chapterId, grade, difficulty, isSystem } = req.query

    const questions = await prisma.question.findMany({
      where: {
        ...(chapterId ? { chapterId: String(chapterId) } : {}),
        ...(grade ? { grade: grade as any } : {}),
        ...(difficulty ? { difficulty: difficulty as any } : {}),
        ...(isSystem !== undefined ? { isSystem: isSystem === 'true' } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        options: true,
        createdBy: { select: { user: { select: { name: true } } } },
        chapter: { select: { name: true } },
      },
    })

    res.json({ success: true, data: questions })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', authMiddleware, roleMiddleware('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const question = await prisma.question.findUnique({
      where: { id: req.params.id },
      include: { options: true },
    })

    if (!question) throw createError('Soal tidak ditemukan', 404)

    res.json({ success: true, data: question })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/',
  authMiddleware,
  roleMiddleware('TEACHER', 'ADMIN'),
  validate(createQuestionSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { options, ...data } = req.body

      let createdById: string | undefined = undefined
      if (req.user!.role === 'TEACHER') {
        const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } })
        if (teacher) createdById = teacher.id
      }

      const question = await prisma.question.create({
        data: {
          ...data,
          createdById,
          isSystem: req.user!.role === 'ADMIN' ? data.isSystem : false,
          options: {
            create: options.map((opt: any) => ({
              label: opt.label,
              text: opt.text,
              isCorrect: opt.isCorrect,
            })),
          },
        },
        include: { options: true },
      })

      res.status(201).json({ success: true, message: 'Soal berhasil dibuat', data: question })
    } catch (err) {
      next(err)
    }
  }
)

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('TEACHER', 'ADMIN'),
  validate(updateQuestionSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { options, ...data } = req.body

      const result = await prisma.$transaction(async (tx) => {
        const q = await tx.question.update({
          where: { id: req.params.id },
          data,
        })

        if (options && options.length > 0) {
          await tx.questionOption.deleteMany({ where: { questionId: q.id } })
          await tx.questionOption.createMany({
            data: options.map((opt: any) => ({
              questionId: q.id,
              label: opt.label,
              text: opt.text,
              isCorrect: opt.isCorrect,
            })),
          })
        }

        return tx.question.findUnique({ where: { id: q.id }, include: { options: true } })
      })

      res.json({ success: true, message: 'Soal berhasil diupdate', data: result })
    } catch (err) {
      if ((err as any).code === 'P2025') {
        next(createError('Soal tidak ditemukan', 404))
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
      await prisma.question.delete({
        where: { id: req.params.id },
      })
      res.json({ success: true, message: 'Soal berhasil dihapus' })
    } catch (err) {
      if ((err as any).code === 'P2025') {
        next(createError('Soal tidak ditemukan', 404))
      } else {
        next(err)
      }
    }
  }
)

router.post(
  '/import',
  authMiddleware,
  roleMiddleware('TEACHER', 'ADMIN'),
  validate(importQuestionsSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { quizId, questionIds } = req.body

      const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, include: { _count: { select: { questions: true } } } })
      if (!quiz) throw createError('Quiz tidak ditemukan', 404)

      let currentOrder = quiz._count.questions

      const creations = questionIds.map((qId: string) => ({
        quizId,
        questionId: qId,
        order: ++currentOrder,
      }))

      const importedCount = await prisma.$transaction(async (tx) => {
        let count = 0
        for (const c of creations) {
          const existing = await tx.quizQuestion.findUnique({
            where: { quizId_questionId: { quizId: c.quizId, questionId: c.questionId } },
          })
          if (!existing) {
            await tx.quizQuestion.create({ data: c })
            await tx.question.update({
              where: { id: c.questionId },
              data: { usageCount: { increment: 1 } },
            })
            count++
          }
        }
        return count
      })

      res.status(201).json({ success: true, message: `${importedCount} soal berhasil di-import` })
    } catch (err) {
      next(err)
    }
  }
)

export default router
