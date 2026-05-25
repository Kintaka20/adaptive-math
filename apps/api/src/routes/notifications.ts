import { Router, Response, NextFunction } from 'express'
import prisma from '../config/database'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json({ success: true, data: notifications })
  } catch (err) {
    next(err)
  }
})

router.put('/:id/read', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.userId },
      data: { isRead: true },
    })
    res.json({ success: true, message: 'Notification marked as read' })
  } catch (err) {
    next(err)
  }
})

router.put('/read-all', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, isRead: false },
      data: { isRead: true },
    })
    res.json({ success: true, message: 'All notifications marked as read' })
  } catch (err) {
    next(err)
  }
})

export default router
