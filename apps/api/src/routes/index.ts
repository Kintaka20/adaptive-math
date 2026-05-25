import { Router } from 'express'
import authRoutes from './auth'
import materialRoutes from './materials'
import quizRoutes from './quizzes'
import questionRoutes from './questions'
import classRoutes from './classes'
import monitoringRoutes from './monitoring'
import auditRoutes from './audit'
import studentRoutes from './students'
import teacherRoutes from './teachers'
import chatRoutes from './chat'
import adminRoutes from './admin'
import schoolRoutes from './schools'
import notificationRoutes from './notifications'

const router = Router()

router.use('/schools', schoolRoutes)

router.use('/auth', authRoutes)
router.use('/materials', materialRoutes)
router.use('/quizzes', quizRoutes)
router.use('/questions', questionRoutes)
router.use('/classes', classRoutes)
router.use('/monitoring', monitoringRoutes)
router.use('/audit', auditRoutes)
router.use('/students', studentRoutes)
router.use('/teachers', teacherRoutes)
router.use('/chat', chatRoutes)
router.use('/admin', adminRoutes)
router.use('/notifications', notificationRoutes)

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() })
})

export default router
