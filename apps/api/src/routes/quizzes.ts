import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import prisma from '../config/database'
import { validate } from '../middleware/validate'
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'

const router = Router()

const createQuizSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  chapterId: z.string(),
  type: z.enum(['PLACEMENT', 'PRACTICE', 'POST_TEST', 'REMEDIAL']).default('PRACTICE'),
  timeLimit: z.number().int().optional(),
  passingScore: z.number().int().min(0).max(100).default(70),
  order: z.number().int().default(0),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  isSystem: z.boolean().default(false),
})

const updateQuizSchema = createQuizSchema.partial()

const submitAttemptSchema = z.object({
  timeSpent: z.number().int().min(0),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOption: z.string(),
      timeSpent: z.number().int().default(0),
    })
  ),
})

router.get('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { chapterId, status } = req.query
    const role = req.user?.role

    const statusFilter = status
      ? { status: status as any }
      : role === 'STUDENT'
        ? { status: 'PUBLISHED' }
        : {}

    const quizzes = await prisma.quiz.findMany({
      where: {
        ...(chapterId ? { chapterId: String(chapterId) } : {}),
        ...statusFilter,
      },
      orderBy: { order: 'asc' },
      include: {
        chapter: { select: { name: true, grade: true } },
        _count: { select: { questions: true } },
      },
    })

    res.json({ success: true, data: quizzes })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: {
        chapter: { select: { name: true, grade: true } },
        questions: {
          orderBy: { order: 'asc' },
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    })

    if (!quiz) throw createError('Quiz tidak ditemukan', 404)

    if (req.user!.role === 'STUDENT') {
      const sanitizedQuiz = {
        ...quiz,
        questions: quiz.questions.map(q => ({
          ...q,
          question: {
            ...q.question,
            explanation: undefined, // Hide explanation before submit
            options: q.question.options.map(({ isCorrect, ...opt }) => opt),
          },
        })),
      }
      return res.json({ success: true, data: sanitizedQuiz })
    }

    res.json({ success: true, data: quiz })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/',
  authMiddleware,
  roleMiddleware('TEACHER', 'ADMIN'),
  validate(createQuizSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = req.body

      const quiz = await prisma.quiz.create({
        data: {
          ...data,
          isSystem: req.user!.role === 'ADMIN' ? data.isSystem : false,
        },
      })

      res.status(201).json({ success: true, message: 'Quiz berhasil dibuat', data: quiz })
    } catch (err) {
      next(err)
    }
  }
)

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('TEACHER', 'ADMIN'),
  validate(updateQuizSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const quiz = await prisma.quiz.update({
        where: { id: req.params.id },
        data: req.body,
      })

      res.json({ success: true, message: 'Quiz berhasil diupdate', data: quiz })
    } catch (err) {
      if ((err as any).code === 'P2025') {
        next(createError('Quiz tidak ditemukan', 404))
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
      await prisma.quiz.delete({
        where: { id: req.params.id },
      })

      res.json({ success: true, message: 'Quiz berhasil dihapus' })
    } catch (err) {
      if ((err as any).code === 'P2025') {
        next(createError('Quiz tidak ditemukan', 404))
      } else {
        next(err)
      }
    }
  }
)

router.post(
  '/:id/start',
  authMiddleware,
  roleMiddleware('STUDENT'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } })
      if (!student) throw createError('Profile siswa tidak ditemukan', 404)

      const quiz = await prisma.quiz.findUnique({
        where: { id: req.params.id },
        include: { _count: { select: { questions: true } } },
      })

      if (!quiz) throw createError('Quiz tidak ditemukan', 404)

      if (quiz.type === 'PLACEMENT') {
        const existingAttempt = await prisma.quizAttempt.findFirst({
          where: { studentId: student.id, quizId: quiz.id, submittedAt: { not: null } },
        })
        if (existingAttempt) {
          throw createError('Kamu sudah pernah mengambil tes penempatan ini.', 403)
        }
      } else if (quiz.type !== 'REMEDIAL') {
        const existingAttempt = await prisma.quizAttempt.findFirst({
          where: {
            studentId: student.id,
            quizId: quiz.id,
            submittedAt: { not: null },
          },
        })
        if (existingAttempt && !existingAttempt.isPassed) {
          throw createError('Kamu sudah pernah mengerjakan kuis ini dan belum lulus. Silakan kerjakan kuis remedial.', 403)
        }
        if (existingAttempt && existingAttempt.isPassed) {
          throw createError('Kamu sudah lulus kuis ini.', 403)
        }
      }


      const attempt = await prisma.quizAttempt.create({
        data: {
          studentId: student.id,
          quizId: quiz.id,
          totalQuestions: quiz._count.questions,
        },
      })

      res.status(201).json({ success: true, message: 'Quiz dimulai', data: attempt })
    } catch (err) {
      next(err)
    }
  }
)

router.post(
  '/:id/submit',
  authMiddleware,
  roleMiddleware('STUDENT'),
  validate(submitAttemptSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const student = await prisma.student.findUnique({ where: { userId: req.user!.userId }, include: { user: { select: { name: true } } } })
      if (!student) throw createError('Profile siswa tidak ditemukan', 404)

      const quiz = await prisma.quiz.findUnique({
        where: { id: req.params.id },
        include: {
          questions: { include: { question: { include: { options: true } } } },
        },
      })

      if (!quiz) throw createError('Quiz tidak ditemukan', 404)

      const { timeSpent, answers } = req.body

      const attempt = await prisma.quizAttempt.findFirst({
        where: { studentId: student.id, quizId: quiz.id, submittedAt: null },
        orderBy: { startedAt: 'desc' },
      })

      if (!attempt) throw createError('Tidak ada sesi quiz yang aktif', 400)

      let correctCount = 0
      const attemptAnswers: { attemptId: string; questionId: string; selectedOption: string; isCorrect: boolean; timeSpent?: number }[] = []

      for (const answer of answers) {
        const questionData = quiz.questions.find(q => q.questionId === answer.questionId)
        if (!questionData) continue

        const correctOption = questionData.question.options.find(o => o.isCorrect)
        const isCorrect = correctOption?.label === answer.selectedOption

        if (isCorrect) correctCount++

        attemptAnswers.push({
          attemptId: attempt.id,
          questionId: answer.questionId,
          selectedOption: answer.selectedOption,
          isCorrect,
          timeSpent: answer.timeSpent,
        })
      }

      const totalQuestions = quiz.questions.length
      const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0
      const isPassed = score >= quiz.passingScore

      const result = await prisma.$transaction(async (tx) => {
        await tx.quizAttemptAnswer.createMany({ data: attemptAnswers })

        
        const baseXP = Math.round(score) // e.g. 80% correct = 80 base XP

        const avgTimePerQuestion = totalQuestions > 0 ? timeSpent / totalQuestions : 0
        let timeBonus = 0
        if (avgTimePerQuestion > 0 && avgTimePerQuestion <= 15) {
          timeBonus = 50  // Lightning fast: < 15s per question
        } else if (avgTimePerQuestion <= 30) {
          timeBonus = 35  // Very fast: 15-30s
        } else if (avgTimePerQuestion <= 60) {
          timeBonus = 20  // Good pace: 30-60s
        } else if (avgTimePerQuestion <= 120) {
          timeBonus = 10  // Average: 1-2 min
        }

        const diffCounts = { EASY: 0, MEDIUM: 0, HARD: 0 }
        for (const q of quiz.questions) {
          const diff = q.question.difficulty || 'MEDIUM'
          if (diff in diffCounts) diffCounts[diff as keyof typeof diffCounts]++
        }
        const totalQ = quiz.questions.length || 1
        const avgDiffScore = (diffCounts.EASY * 1 + diffCounts.MEDIUM * 1.5 + diffCounts.HARD * 2.5) / totalQ
        const difficultyMultiplier = Math.max(1, avgDiffScore) // min 1x

        const perfectBonus = correctCount === totalQuestions && totalQuestions > 0 ? 25 : 0

        const streakBonus = Math.min(student.streakDays * 2, 20) // max +20 from streak

        const rawXP = (baseXP + timeBonus + perfectBonus + streakBonus) * difficultyMultiplier
        const earnedXP = Math.round(Math.max(isPassed ? 20 : 5, rawXP)) // Minimum 20 XP if passed, 5 if failed

        const updatedAttempt = await tx.quizAttempt.update({
          where: { id: attempt.id },
          data: {
            score,
            correctCount,
            timeSpent,
            submittedAt: new Date(),
            isPassed,
          },
          include: { answers: true },
        })

        await tx.student.update({
          where: { id: student.id },
          data: {
            totalXP: { increment: earnedXP },
            lastActiveAt: new Date(),
            streakDays: student.lastActiveAt && 
              (new Date().getTime() - new Date(student.lastActiveAt).getTime()) < 48 * 60 * 60 * 1000
              ? { increment: student.lastActiveAt.toDateString() !== new Date().toDateString() ? 1 : 0 }
              : 1, // Reset streak if gap > 48h
          },
        })

        const newTotalXP = student.totalXP + earnedXP
        const newLevel = Math.floor(newTotalXP / 500) + 1
        if (newLevel > student.currentLevel) {
          await tx.student.update({
            where: { id: student.id },
            data: { currentLevel: newLevel },
          })
        }

        return {
          ...updatedAttempt,
          xpBreakdown: {
            baseXP,
            timeBonus,
            difficultyMultiplier: Math.round(difficultyMultiplier * 100) / 100,
            perfectBonus,
            streakBonus,
            totalXP: earnedXP,
          },
        }
      })

      
      const enrollments = await prisma.classroomEnrollment.findMany({
        where: { studentId: student.id, isActive: true },
        include: { classroom: { include: { teacher: { include: { user: true } } } } }
      })
      const classroomChapter = await prisma.classroomChapter.findFirst({
        where: {
          chapterId: quiz.chapterId,
          classroomId: { in: enrollments.map(e => e.classroomId) }
        },
        include: { classroom: { include: { teacher: true } } }
      })
      const classroom = classroomChapter?.classroom
      const isAutoRemedial = classroom ? classroom.autoRemedial : true

      let remedialPlan = null
      if (!isPassed && quiz.type !== 'REMEDIAL' && quiz.type !== 'PLACEMENT') {
        try {
          if (classroom) {
            await prisma.notification.create({
              data: {
                userId: classroom.teacher.userId,
                title: isAutoRemedial ? 'Siswa Gagal Kuis' : 'Remedial Manual Diperlukan',
                message: `Siswa ${student.user.name} mendapatkan nilai ${Math.round(score)} (KKM: ${quiz.passingScore}) pada kuis "${quiz.title}". ${isAutoRemedial ? 'Sistem telah menyiapkan remedial otomatis.' : 'Silakan berikan remedial manual di halaman Monitoring.'}`,
                type: 'WARNING',
                link: `/guru/monitoring/siswa/${student.id}`
              }
            })
          }

          if (!isAutoRemedial) {
            remedialPlan = {
              message: 'Kamu belum lulus kuis ini. Guru akan meninjau nilaimu dan memberikan remedial secara manual.'
            }
          } else {
          const wrongQuestionIds = attemptAnswers
            .filter(a => !a.isCorrect)
            .map(a => a.questionId)

          const wrongQuestions = quiz.questions
            .filter(q => wrongQuestionIds.includes(q.questionId))
            .map(q => q.question)

          const difficultyMap: Record<string, string> = {
            'HARD': 'MEDIUM',
            'MEDIUM': 'EASY',
            'EASY': 'EASY',
          }
          
          const wrongDiffs = wrongQuestions.map(q => q.difficulty || 'MEDIUM')
          const targetDifficulty = difficultyMap[wrongDiffs[0]] || 'EASY'

          const remedialQuestions = await prisma.question.findMany({
            where: {
              chapterId: quiz.chapterId,
              difficulty: targetDifficulty as any,
              id: { notIn: quiz.questions.map(q => q.questionId) },
            },
            take: Math.max(3, Math.min(wrongQuestionIds.length, 5)), // 3-5 questions
            orderBy: { createdAt: 'desc' },
            include: { options: true },
          })

          let finalQuestionIds = remedialQuestions.map(q => q.id)
          if (finalQuestionIds.length < 3) {
            const extraIds = wrongQuestionIds
              .filter(id => !finalQuestionIds.includes(id))
              .slice(0, 5 - finalQuestionIds.length)
            finalQuestionIds = [...finalQuestionIds, ...extraIds]
          }

          if (finalQuestionIds.length > 0) {
            const remedialQuiz = await prisma.quiz.create({
              data: {
                title: `Remedial: ${quiz.title}`,
                description: `Kuis remedial otomatis berdasarkan kelemahan di "${quiz.title}". Fokus pada soal yang lebih mudah untuk membangun pemahaman.`,
                chapterId: quiz.chapterId,
                type: 'REMEDIAL',
                timeLimit: quiz.timeLimit ? Math.round(quiz.timeLimit * 1.5) : undefined, // 50% more time
                passingScore: Math.max(60, quiz.passingScore - 10), // Slightly lower passing score
                status: 'PUBLISHED',
                isSystem: true,
                questions: {
                  create: finalQuestionIds.map((qId, idx) => ({
                    questionId: qId,
                    order: idx + 1,
                  })),
                },
              },
            })

            const chapterMaterials = await prisma.material.findMany({
              where: {
                chapterId: quiz.chapterId,
                status: 'PUBLISHED',
              },
              select: { id: true, title: true, duration: true },
              orderBy: { order: 'asc' },
            })

            const completedMaterialIds = await prisma.materialProgress.findMany({
              where: { studentId: student.id, isCompleted: true },
              select: { materialId: true },
            })
            const completedSet = new Set(completedMaterialIds.map(m => m.materialId))

            const recommendedMaterials = chapterMaterials.map(m => ({
              ...m,
              isCompleted: completedSet.has(m.id),
              isRecommended: !completedSet.has(m.id), // Recommend uncompleted ones
            }))

            remedialPlan = {
              remedialQuizId: remedialQuiz.id,
              remedialQuizTitle: remedialQuiz.title,
              totalQuestions: finalQuestionIds.length,
              targetDifficulty,
              passingScore: remedialQuiz.passingScore,
              weakAreas: wrongQuestions.map(q => q.text.substring(0, 80) + '...'),
              wrongCount: wrongQuestionIds.length,
              totalOriginal: totalQuestions,
              recommendedMaterials,
              message: `Kamu menjawab salah ${wrongQuestionIds.length} dari ${totalQuestions} soal. ` +
                `Kami sudah menyiapkan kuis remedial dengan ${finalQuestionIds.length} soal yang lebih mudah. ` +
                `Pelajari ulang materi yang direkomendasikan, lalu kerjakan kuis remedial.`,
            }
          }
          } // end of isAutoRemedial else block
        } catch (remedialErr) {
          console.error('Failed to generate remedial / notification:', remedialErr)
        }
      }

      res.json({
        success: true,
        message: isPassed ? 'Quiz selesai - Lulus! 🎉' : 'Quiz selesai - Belum lulus, remedial tersedia',
        data: result,
        remedialPlan,
      })
    } catch (err) {
      next(err)
    }
  }
)

router.get(
  '/attempts/:attemptId',
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const attempt = await prisma.quizAttempt.findUnique({
        where: { id: req.params.attemptId },
        include: {
          quiz: {
            include: {
              chapter: { select: { name: true } },
            },
          },
          answers: {
            include: {
              question: {
                include: { options: true },
              },
            },
          },
        },
      })

      if (!attempt) throw createError('Hasil kuis tidak ditemukan', 404)

      if (req.user!.role === 'STUDENT') {
        const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } })
        if (!student || attempt.studentId !== student.id) {
          throw createError('Akses ditolak', 403)
        }
      }

      const totalQ = attempt.answers.length || 1
      const avgTime = attempt.timeSpent / totalQ
      let timeBonus = 0
      if (avgTime > 0 && avgTime <= 15) timeBonus = 50
      else if (avgTime <= 30) timeBonus = 35
      else if (avgTime <= 60) timeBonus = 20
      else if (avgTime <= 120) timeBonus = 10

      const enrichedAttempt = {
        ...attempt,
        correctCount: attempt.correctCount ?? attempt.answers.filter((a: any) => a.isCorrect).length,
        wrongCount: attempt.answers.filter((a: any) => !a.isCorrect && a.selectedOption).length,
        avgTimePerQuestion: Math.round(avgTime),
        xpBreakdown: {
          baseXP: Math.round(attempt.score),
          timeBonus,
          perfectBonus: (attempt.correctCount === attempt.totalQuestions && attempt.totalQuestions > 0) ? 25 : 0,
          totalXP: attempt.isPassed 
            ? Math.round(attempt.score) + timeBonus + ((attempt.correctCount === attempt.totalQuestions) ? 25 : 0)
            : Math.max(5, Math.round(attempt.score * 0.3)),
        },
        answers: attempt.answers.map((a: any) => ({
          id: a.id,
          text: a.question.text,
          topic: a.question.chapter?.name ?? null,
          options: a.question.options.map((o: any) => ({ id: o.label, text: o.text })),
          correctOptionId: a.question.options.find((o: any) => o.isCorrect)?.label,
          selectedOptionId: a.selectedOption,
          isCorrect: a.isCorrect,
          explanation: a.question.explanation,
          timeSpent: a.timeSpent,
        })),
      }

      res.json({ success: true, data: enrichedAttempt })
    } catch (err) {
      next(err)
    }
  }
)
router.get(
  '/:id/remedial',
  authMiddleware,
  roleMiddleware('STUDENT'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } })
      if (!student) throw createError('Profile siswa tidak ditemukan', 404)

      const quiz = await prisma.quiz.findUnique({
        where: { id: req.params.id },
        select: { id: true, title: true, chapterId: true, passingScore: true },
      })
      if (!quiz) throw createError('Quiz tidak ditemukan', 404)

      const lastAttempt = await prisma.quizAttempt.findFirst({
        where: { studentId: student.id, quizId: quiz.id, submittedAt: { not: null } },
        orderBy: { submittedAt: 'desc' },
        include: {
          answers: { where: { isCorrect: false }, select: { questionId: true } },
        },
      })

      if (!lastAttempt || lastAttempt.isPassed) {
        return res.json({ success: true, data: null, message: 'Tidak ada remedial yang diperlukan' })
      }

      const remedialQuiz = await prisma.quiz.findFirst({
        where: {
          chapterId: quiz.chapterId,
          type: 'REMEDIAL',
          status: 'PUBLISHED',
          title: { contains: quiz.title },
        },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { questions: true } } },
      })

      let remedialPassed = false
      if (remedialQuiz) {
        const remedialAttempt = await prisma.quizAttempt.findFirst({
          where: { studentId: student.id, quizId: remedialQuiz.id, isPassed: true },
        })
        remedialPassed = !!remedialAttempt
      }

      const chapterMaterials = await prisma.material.findMany({
        where: { chapterId: quiz.chapterId, status: 'PUBLISHED' },
        select: { id: true, title: true, duration: true },
        orderBy: { order: 'asc' },
      })

      const completedProgress = await prisma.materialProgress.findMany({
        where: { studentId: student.id, isCompleted: true },
        select: { materialId: true },
      })
      const completedSet = new Set(completedProgress.map(m => m.materialId))

      res.json({
        success: true,
        data: {
          originalQuiz: { id: quiz.id, title: quiz.title, passingScore: quiz.passingScore },
          lastScore: lastAttempt.score,
          wrongCount: lastAttempt.answers.length,
          remedialQuiz: remedialQuiz ? {
            id: remedialQuiz.id,
            title: remedialQuiz.title,
            totalQuestions: remedialQuiz._count.questions,
            isPassed: remedialPassed,
          } : null,
          recommendedMaterials: chapterMaterials.map(m => ({
            ...m,
            isCompleted: completedSet.has(m.id),
          })),
        },
      })
    } catch (err) {
      next(err)
    }
  }
)

export default router
