import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import prisma from '../config/database'
import { validate } from '../middleware/validate'
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'

const router = Router()

router.get('/profile', authMiddleware, roleMiddleware('TEACHER'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: req.user!.userId },
      include: {
        user: { select: { name: true, email: true, avatar: true, phone: true, createdAt: true } },
        school: { select: { id: true, name: true, city: true } },
        _count: {
          select: {
            classes: true,
          },
        },
      },
    })

    if (!teacher) throw createError('Profile guru tidak ditemukan', 404)

    res.json({ success: true, data: teacher })
  } catch (err) {
    next(err)
  }
})

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  nip: z.string().optional(),
  schoolId: z.string().optional(),
})

router.put('/profile', authMiddleware, roleMiddleware('TEACHER'), validate(updateProfileSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, phone, avatar, nip, schoolId } = req.body

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name, phone, avatar },
      select: { name: true, email: true, avatar: true, phone: true },
    })

    const updateTeacherData: Record<string, unknown> = {}
    if (nip !== undefined) updateTeacherData.nip = nip
    if (schoolId) updateTeacherData.schoolId = schoolId

    let teacher = null
    if (Object.keys(updateTeacherData).length > 0) {
      teacher = await prisma.teacher.update({
        where: { userId: req.user!.userId },
        data: updateTeacherData,
        include: {
          school: { select: { id: true, name: true, city: true } },
        },
      })
    }

    res.json({
      success: true,
      message: 'Profile diperbarui',
      data: {
        user: updatedUser,
        teacher,
      },
    })
  } catch (err) {
    next(err)
  }
})

export default router
