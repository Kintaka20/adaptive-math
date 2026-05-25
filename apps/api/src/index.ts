import './config/env' // validate env first
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { env } from './config/env'
import routes from './routes'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'

const app = express()

app.use(helmet())
app.use(cors({
  origin: [
    env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
  ],
  credentials: true,
}))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: env.NODE_ENV === 'development' ? 5000 : 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
})
app.use('/api', limiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'development' ? 5000 : 10,
  message: { success: false, message: 'Too many login attempts, please try again later.' }
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/api', routes)

app.use(notFoundHandler)
app.use(errorHandler)

const start = async () => {
  try {
    app.listen(env.PORT, () => {
      console.log(`\n🚀 API Server running at http://localhost:${env.PORT}`)
      console.log(`📦 Environment: ${env.NODE_ENV}`)
      console.log(`🌐 Frontend URL: ${env.FRONTEND_URL}`)
      console.log(`\nEndpoints:`)
      console.log(`  POST /api/auth/register`)
      console.log(`  POST /api/auth/login`)
      console.log(`  GET  /api/auth/me`)
      console.log(`  GET  /api/health\n`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

if (!process.env.VERCEL) {
  start()
}

export default app
