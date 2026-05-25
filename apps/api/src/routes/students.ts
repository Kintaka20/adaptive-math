import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import prisma from '../config/database'
import { validate } from '../middleware/validate'
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'

const router = Router()

router.get('/dashboard', authMiddleware, roleMiddleware('STUDENT'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.userId },
      include: {
        user: { select: { name: true, email: true, avatar: true } },
        materialProgress: { select: { isCompleted: true } },
        quizAttempts: {
          where: { submittedAt: { not: null } },
          orderBy: { submittedAt: 'desc' },
          take: 5,
          select: { score: true, isPassed: true, submittedAt: true, quiz: { select: { title: true } } },
        },
        badges: { include: { badge: true }, orderBy: { earnedAt: 'desc' }, take: 3 },
        enrollments: {
          where: { isActive: true },
          include: {
            classroom: {
              include: {
                teacher: { select: { user: { select: { name: true } } } },
                _count: { select: { enrollments: true, chapters: true } },
              },
            },
          },
          orderBy: { joinedAt: 'desc' },
        },
      },
    })

    if (!student) throw createError('Profile siswa tidak ditemukan', 404)

    const completedMaterials = student.materialProgress.filter(p => p.isCompleted).length
    const totalAttempts = student.quizAttempts.length
    const avgScore = totalAttempts > 0 ? student.quizAttempts.reduce((s, a) => s + a.score, 0) / totalAttempts : 0

    const ranking = await prisma.student.count({ where: { totalXP: { gt: student.totalXP } } })

    const enrolledClasses = student.enrollments.map(e => ({
      id: e.classroom.id,
      name: e.classroom.name,
      grade: e.classroom.grade,
      joinCode: e.classroom.joinCode,
      teacherName: e.classroom.teacher?.user?.name || 'Guru',
      totalStudents: e.classroom._count.enrollments,
      totalChapters: e.classroom._count.chapters,
      joinedAt: e.joinedAt,
      isFinished: e.classroom.isFinished,
    }))

    res.json({
      success: true,
      data: {
        user: student.user,
        stats: {
          totalXP: student.totalXP,
          currentLevel: student.currentLevel,
          streakDays: student.streakDays,
          rank: ranking + 1,
          completedMaterials,
          avgScore: Math.round(avgScore * 10) / 10,
        },
        enrolledClasses,
        recentAttempts: student.quizAttempts,
        recentBadges: student.badges,
      },
    })
  } catch (err) {
    next(err)
  }
})

router.get('/learning-path', authMiddleware, roleMiddleware('STUDENT'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { classId } = req.query

    let classroomFilter: any = { isActive: true }
    if (classId) {
      classroomFilter.id = classId as string
    } else {
      classroomFilter.isFinished = false
    }

    const student = await prisma.student.findUnique({
      where: { userId: req.user!.userId },
      include: {
        enrollments: {
          where: { isActive: true, classroom: classroomFilter },
          orderBy: { joinedAt: 'desc' }, // Get most recent first
          take: classId ? undefined : 1, // If no classId, only get the most recent active unfinished class
          include: {
            classroom: {
              include: {
                chapters: {
                  orderBy: { order: 'asc' },
                  include: {
                    chapter: {
                      include: {
                        materials: { where: { status: 'PUBLISHED' }, orderBy: { order: 'asc' }, select: { id: true, title: true, duration: true } },
                        quizzes: { where: { status: 'PUBLISHED' }, orderBy: { order: 'asc' }, select: { id: true, title: true, type: true, passingScore: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        materialProgress: { select: { materialId: true, isCompleted: true, progress: true } },
        quizAttempts: { where: { submittedAt: { not: null } }, select: { quizId: true, score: true, isPassed: true } },
      },
    })

    if (!student) throw createError('Profile siswa tidak ditemukan', 404)

    const completedMaterialIds = new Set(student.materialProgress.filter(p => p.isCompleted).map(p => p.materialId))
    const passedQuizIds = new Set(student.quizAttempts.filter(a => a.isPassed).map(a => a.quizId))

    const seenChapterIds = new Set<string>()
    const allChapters = student.enrollments.flatMap(e =>
      e.classroom.chapters.map(cc => ({
        order: cc.order,
        isLocked: cc.isLocked,
        chapter: cc.chapter,
      }))
    ).filter(cc => {
      if (seenChapterIds.has(cc.chapter.id)) return false
      seenChapterIds.add(cc.chapter.id)
      return true
    }).sort((a, b) => a.order - b.order)

    const learningPath = await Promise.all(allChapters.map(async (cc, index) => {
      const materials = cc.chapter.materials.map(m => ({
        ...m,
        isCompleted: completedMaterialIds.has(m.id),
        progress: student.materialProgress.find(p => p.materialId === m.id)?.progress ?? 0,
      }))

      const quizzes = await Promise.all(cc.chapter.quizzes.map(async (q) => {
        const attempts = student.quizAttempts.filter(a => a.quizId === q.id)
        const isPassed = passedQuizIds.has(q.id)
        const hasAttempted = attempts.length > 0
        const isFailed = hasAttempted && !isPassed
        const bestScore = Math.max(0, ...attempts.map(a => a.score))

        let remedialQuizId: string | null = null
        if (isFailed) {
          const remedialQuiz = await prisma.quiz.findFirst({
            where: {
              chapterId: cc.chapter.id,
              type: 'REMEDIAL',
              status: 'PUBLISHED',
            },
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true },
          })
          if (remedialQuiz) remedialQuizId = remedialQuiz.id
        }

        return {
          ...q,
          isPassed,
          isFailed,
          hasAttempted,
          bestScore,
          remedialQuizId,
        }
      }))

      let isLocked = false
      if (index === 0) {
        isLocked = false
      } else {
        const prevChapter = allChapters[index - 1]
        const prevMaterials = prevChapter.chapter.materials
        const prevQuizzes = prevChapter.chapter.quizzes

        const allPrevMaterialsDone = prevMaterials.length === 0 ||
          prevMaterials.every(m => completedMaterialIds.has(m.id))
        const anyPrevQuizPassed = prevQuizzes.length === 0 ||
          prevQuizzes.some(q => passedQuizIds.has(q.id))

        isLocked = !(allPrevMaterialsDone && anyPrevQuizPassed)
      }

      return {
        chapter: {
          id: cc.chapter.id,
          name: cc.chapter.name,
          order: cc.order,
          isLocked,
        },
        materials,
        quizzes,
      }
    }))

    res.json({ success: true, data: learningPath })
  } catch (err) {
    next(err)
  }
})

router.get('/ranking', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = '20' } = req.query

    const topStudents = await prisma.student.findMany({
      take: Math.min(Number(limit), 100),
      orderBy: { totalXP: 'desc' },
      include: { user: { select: { name: true, avatar: true } } },
    })

    const result = topStudents.map((s, idx) => ({
      rank: idx + 1,
      id: s.id,
      name: s.user.name,
      avatar: s.user.avatar,
      totalXP: s.totalXP,
      currentLevel: s.currentLevel,
      grade: s.grade,
      streakDays: s.streakDays,
    }))

    const currentStudent = await prisma.student.findUnique({ where: { userId: req.user!.userId } })
    let currentRank = null
    if (currentStudent) {
      const rank = await prisma.student.count({ where: { totalXP: { gt: currentStudent.totalXP } } })
      currentRank = { rank: rank + 1, totalXP: currentStudent.totalXP, currentLevel: currentStudent.currentLevel }
    }

    res.json({ success: true, data: result, currentRank })
  } catch (err) {
    next(err)
  }
})

router.get('/profile', authMiddleware, roleMiddleware('STUDENT'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.userId },
      include: {
        user: { select: { name: true, email: true, avatar: true, phone: true, createdAt: true } },
        school: { select: { name: true, city: true } },
        badges: { include: { badge: true }, orderBy: { earnedAt: 'desc' } },
      },
    })

    if (!student) throw createError('Profile siswa tidak ditemukan', 404)
    res.json({ success: true, data: student })
  } catch (err) {
    next(err)
  }
})

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  schoolId: z.string().optional(),
})

router.put('/profile', authMiddleware, roleMiddleware('STUDENT'), validate(updateProfileSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, phone, avatar, schoolId } = req.body

    const updated = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name, phone, avatar },
      select: { name: true, email: true, avatar: true, phone: true },
    })

    if (schoolId) {
      await prisma.student.update({
        where: { userId: req.user!.userId },
        data: { schoolId },
      })
    }

    res.json({ success: true, message: 'Profile diperbarui', data: updated })
  } catch (err) {
    next(err)
  }
})

router.get('/badges', authMiddleware, roleMiddleware('STUDENT'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } })
    if (!student) throw createError('Profile siswa tidak ditemukan', 404)

    const [earned, allBadges] = await Promise.all([
      prisma.studentBadge.findMany({
        where: { studentId: student.id },
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
      }),
      prisma.badge.findMany(),
    ])

    const earnedIds = new Set(earned.map(e => e.badgeId))

    res.json({
      success: true,
      data: {
        earned: earned.map(e => ({ ...e.badge, earnedAt: e.earnedAt })),
        locked: allBadges.filter(b => !earnedIds.has(b.id)),
      },
    })
  } catch (err) {
    next(err)
  }
})

export default router