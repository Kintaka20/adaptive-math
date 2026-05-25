import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'

export interface AppError extends Error {
  statusCode?: number
  code?: string
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  if (env.NODE_ENV === 'development') {
    console.error('❌ Error:', err)
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: 'Route not found' })
}

export const createError = (message: string, statusCode = 500): AppError => {
  const error = new Error(message) as AppError
  error.statusCode = statusCode
  return error
}
