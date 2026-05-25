import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import prisma from '../config/database'
import { hashPassword, comparePassword, generateSecureToken, hashToken } from '../utils/hash'
import { signToken } from '../utils/jwt'
import { validate } from '../middleware/validate'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'

const router = Router()

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  role: z.enum(['STUDENT', 'TEACHER']),
  schoolId: z.string().min(1, 'Sekolah wajib dipilih'),
  grade: z.enum(['X', 'XI', 'XII']).optional(),
  nip: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
})

router.post('/register', validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role, schoolId, grade, nip } = req.body

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw createError('Email sudah terdaftar', 409)
    }

    // Validate school exists
    const school = await prisma.school.findUnique({ where: { id: schoolId } })
    if (!school) {
      throw createError('Sekolah tidak ditemukan', 400)
    }

    const hashed = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role,
        isActive: role === 'TEACHER' ? false : true,
        ...(role === 'STUDENT' && {
          student: {
            create: {
              schoolId,
              grade: grade || 'X',
            },
          },
        }),
        ...(role === 'TEACHER' && {
          teacher: {
            create: {
              schoolId,
              nip,
            },
          },
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    const token = signToken({ userId: user.id, role: user.role, email: user.email })

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: { user, token },
    })
  } catch (err) {
    next(err)
  }
})

router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email, isActive: true },
      include: {
        student: { select: { id: true, grade: true, totalXP: true, currentLevel: true, schoolId: true, school: { select: { id: true, name: true, city: true } } } },
        teacher: { select: { id: true, nip: true, schoolId: true, school: { select: { id: true, name: true, city: true } } } },
      },
    })

    if (!user) {
      throw createError('Email atau password salah', 401)
    }

    const isValid = await comparePassword(password, user.password)
    if (!isValid) {
      throw createError('Email atau password salah', 401)
    }

    const token = signToken({ userId: user.id, role: user.role, email: user.email })

    const { password: _pw, ...safeUser } = user

    res.json({
      success: true,
      message: 'Login berhasil',
      data: { user: safeUser, token },
    })
  } catch (err) {
    next(err)
  }
})

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            grade: true,
            totalXP: true,
            currentLevel: true,
            streakDays: true,
            schoolId: true,
            school: { select: { id: true, name: true, city: true } },
          },
        },
        teacher: {
          select: {
            id: true,
            nip: true,
            schoolId: true,
            school: { select: { id: true, name: true, city: true } },
          },
        },
      },
    })

    if (!user) throw createError('User tidak ditemukan', 404)

    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
})

router.post('/logout', authMiddleware, (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logout berhasil' })
})

router.post('/forgot-password', validate(forgotPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Return same response to prevent email enumeration
      res.json({ success: true, message: 'Jika email terdaftar, link reset akan dikirim' })
      return
    }

    // Invalidate any existing tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    })

    // Generate secure token
    const rawToken = generateSecureToken(32)
    const hashedToken = hashToken(rawToken)

    // Store hashed token in database with 1 hour expiry
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    })

    // TODO: In production, send email with reset link containing rawToken
    // For development, return the token in the response
    res.json({
      success: true,
      message: 'Link reset password telah dikirim ke email Anda',
      // Development only — remove in production
      data: { resetToken: rawToken },
    })
  } catch (err) {
    next(err)
  }
})

router.post('/reset-password', validate(resetPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body

    // Hash the incoming token to compare with stored hash
    const hashedToken = hashToken(token)

    // Find valid, unused, non-expired token
    const resetRecord = await prisma.passwordResetToken.findFirst({
      where: {
        token: hashedToken,
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    })

    if (!resetRecord) {
      throw createError('Token reset tidak valid atau sudah expired', 400)
    }

    // Hash new password and update user
    const hashedPassword = await hashPassword(password)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ])

    res.json({ success: true, message: 'Password berhasil direset' })
  } catch (err) {
    next(err)
  }
})

export default router
