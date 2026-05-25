import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import prisma from '../config/database'

export interface AuthRequest extends Request {
  user?: {
    userId: string
    role: string
    email: string
  }
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Unauthorized: No token provided' })
      return
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, isActive: true },
      select: { id: true, role: true, email: true },
    })

    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized: User not found' })
      return
    }

    req.user = { userId: user.id, role: user.role, email: user.email }
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' })
  }
}

export const roleMiddleware = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' })
      return
    }
    next()
  }
}
