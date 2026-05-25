import { Router, Response, NextFunction } from 'express'
import prisma from '../config/database'

const router = Router()

router.get('/', async (_req, res: Response, next: NextFunction) => {
  try {
    const schools = await prisma.school.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        city: true,
        province: true,
      }
    })
    res.json({ success: true, data: schools })
  } catch (err) {
    next(err)
  }
})

export default router
