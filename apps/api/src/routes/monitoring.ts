import { Router, Response, NextFunction } from 'express'
import prisma from '../config/database'
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'

const router = Router()

router.get('/overview', authMiddleware, roleMiddleware('TEACHER'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } })
    if (!teacher) throw createError('Profile guru tidak ditemukan', 404)

    const classes = await prisma.classroom.findMany({
      where: { teacherId: teacher.id, isActive: true },
      include: { _count: { select: { enrollments: true } } },
    })

    const classIds = classes.map(c => c.id)
    const studentIds = (
      await prisma.classroomEnrollment.findMany({
        where: { classroomId: { in: classIds }, isActive: true },
        select: { studentId: true },
      })
    ).map(e => e.studentId)

    const totalStudents = new Set(studentIds).size

    const attempts = await prisma.quizAttempt.findMany({
      where: { studentId: { in: [...new Set(studentIds)] }, submittedAt: { not: null } },
      select: { score: true, isPassed: true },
    })

    const avgScore =
      attempts.length > 0
        ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
        : 0
    const passRate =
      attempts.length > 0
        ? (attempts.filter(a => a.isPassed).length / attempts.length) * 100
        : 0

    const struggling = await prisma.student.findMany({
      where: { id: { in: [...new Set(studentIds)] } },
      include: {
        user: { select: { name: true, email: true } },
        quizAttempts: {
          where: { submittedAt: { not: null } },
          orderBy: { submittedAt: 'desc' },
          take: 5,
          select: { score: true, isPassed: true },
        },
      },
    })

    const strugglingStudents = struggling
      .filter(s => {
        if (s.quizAttempts.length === 0) return false
        const avg = s.quizAttempts.reduce((sum, a) => sum + a.score, 0) / s.quizAttempts.length
        return avg < 60
      })
      .map(s => ({ id: s.id, name: s.user.name, avgScore: s.quizAttempts.reduce((sum, a) => sum + a.score, 0) / s.quizAttempts.length }))

    res.json({
      success: true,
      data: {
        totalClasses: classes.length,
        totalStudents,
        totalAttempts: attempts.length,
        avgScore: Math.round(avgScore * 10) / 10,
        passRate: Math.round(passRate * 10) / 10,
        strugglingCount: strugglingStudents.length,
        classes: classes.map(c => ({ id: c.id, name: c.name, grade: c.grade, studentCount: c._count.enrollments })),
      },
    })
  } catch (err) {
    next(err)
  }
})

router.get('/students', authMiddleware, roleMiddleware('TEACHER'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } })
    if (!teacher) throw createError('Profile guru tidak ditemukan', 404)

    const { classId } = req.query

    let studentIds: string[]
    if (classId) {
      const cls = await prisma.classroom.findFirst({ where: { id: String(classId), teacherId: teacher.id } })
      if (!cls) throw createError('Kelas tidak ditemukan', 404)

      studentIds = (
        await prisma.classroomEnrollment.findMany({
          where: { classroomId: cls.id, isActive: true },
          select: { studentId: true },
        })
      ).map(e => e.studentId)
    } else {
      const classes = await prisma.classroom.findMany({
        where: { teacherId: teacher.id, isActive: true },
        select: { id: true },
      })
      const allEnrollments = await prisma.classroomEnrollment.findMany({
        where: { classroomId: { in: classes.map(c => c.id) }, isActive: true },
        select: { studentId: true },
      })
      studentIds = [...new Set(allEnrollments.map(e => e.studentId))]
    }

    const students = await prisma.student.findMany({
      where: { id: { in: studentIds } },
      include: {
        user: { select: { name: true, email: true, avatar: true } },
        quizAttempts: {
          where: { submittedAt: { not: null } },
          orderBy: { submittedAt: 'desc' },
          take: 10,
          select: { score: true, isPassed: true, submittedAt: true },
        },
        materialProgress: {
          select: { isCompleted: true },
        },
      },
      orderBy: { totalXP: 'desc' },
    })

    const result = students.map(s => {
      const attempts = s.quizAttempts
      const avgScore = attempts.length > 0 ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length : 0
      const passRate = attempts.length > 0 ? (attempts.filter(a => a.isPassed).length / attempts.length) * 100 : 0
      const completedMaterials = s.materialProgress.filter(p => p.isCompleted).length

      return {
        id: s.id,
        name: s.user.name,
        email: s.user.email,
        avatar: s.user.avatar,
        grade: s.grade,
        totalXP: s.totalXP,
        currentLevel: s.currentLevel,
        streakDays: s.streakDays,
        avgScore: Math.round(avgScore * 10) / 10,
        passRate: Math.round(passRate * 10) / 10,
        totalAttempts: attempts.length,
        completedMaterials,
        status: avgScore < 60 ? 'struggling' : avgScore < 75 ? 'average' : 'good',
      }
    })

    res.json({ success: true, data: result, total: result.length })
  } catch (err) {
    next(err)
  }
})

router.get('/students/:id', authMiddleware, roleMiddleware('TEACHER'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } })
    if (!teacher) throw createError('Profile guru tidak ditemukan', 404)

    // Verify the student belongs to one of this teacher's classes
    const teacherClasses = await prisma.classroom.findMany({
      where: { teacherId: teacher.id, isActive: true },
      select: { id: true },
    })
    const enrollment = await prisma.classroomEnrollment.findFirst({
      where: {
        studentId: req.params.id,
        classroomId: { in: teacherClasses.map(c => c.id) },
        isActive: true,
      },
    })
    if (!enrollment) throw createError('Siswa tidak ditemukan di kelas Anda', 403)

    const classId = req.query.classId as string | undefined
    let chapterIds: string[] | undefined = undefined

    if (classId) {
      const classChapters = await prisma.classroomChapter.findMany({
        where: { classroomId: classId },
        select: { chapterId: true }
      })
      chapterIds = classChapters.map(c => c.chapterId)
    }

    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true, avatar: true, createdAt: true } },
        materialProgress: {
          where: chapterIds ? { material: { chapterId: { in: chapterIds } } } : undefined,
          include: { material: { select: { title: true, chapterId: true, duration: true } } },
          orderBy: { completedAt: 'desc' },
        },
        quizAttempts: {
          where: { 
            submittedAt: { not: null },
            ...(chapterIds ? { quiz: { chapterId: { in: chapterIds } } } : {})
          },
          orderBy: { submittedAt: 'desc' },
          include: {
            quiz: { select: { title: true, type: true, passingScore: true } },
          },
        },
        badges: { include: { badge: true } },
      },
    })

    if (!student) throw createError('Siswa tidak ditemukan', 404)

    const attempts = student.quizAttempts
    const avgScore = attempts.length > 0 ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length : 0

    res.json({
      success: true,
      data: {
        ...student,
        stats: {
          avgScore: Math.round(avgScore * 10) / 10,
          totalAttempts: attempts.length,
          passedAttempts: attempts.filter(a => a.isPassed).length,
          completedMaterials: student.materialProgress.filter(p => p.isCompleted).length,
        },
      },
    })
  } catch (err) {
    next(err)
  }
})

router.get('/struggle', authMiddleware, roleMiddleware('TEACHER'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } })
    if (!teacher) throw createError('Profile guru tidak ditemukan', 404)

    const classes = await prisma.classroom.findMany({
      where: { teacherId: teacher.id, isActive: true },
      select: { id: true },
    })

    const enrollments = await prisma.classroomEnrollment.findMany({
      where: { classroomId: { in: classes.map(c => c.id) }, isActive: true },
      select: { studentId: true },
    })
    const studentIds = [...new Set(enrollments.map(e => e.studentId))]

    const students = await prisma.student.findMany({
      where: { id: { in: studentIds } },
      include: {
        user: { select: { name: true, email: true, avatar: true } },
        quizAttempts: {
          where: { submittedAt: { not: null } },
          orderBy: { submittedAt: 'desc' },
          take: 5,
          select: { score: true, quizId: true, submittedAt: true, isPassed: true },
        },
      },
    })

    const struggling = students
      .map(s => {
        const attempts = s.quizAttempts
        const avgScore = attempts.length > 0 ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length : 0
        return { student: s, avgScore }
      })
      .filter(({ avgScore, student }) => avgScore < 60 && student.quizAttempts.length > 0)
      .sort((a, b) => a.avgScore - b.avgScore)
      .map(({ student, avgScore }) => ({
        id: student.id,
        name: student.user.name,
        email: student.user.email,
        avatar: student.user.avatar,
        grade: student.grade,
        avgScore: Math.round(avgScore * 10) / 10,
        totalAttempts: student.quizAttempts.length,
        lastActivity: student.quizAttempts[0]?.submittedAt,
      }))

    res.json({ success: true, data: struggling, total: struggling.length })
  } catch (err) {
    next(err)
  }
})

export default router