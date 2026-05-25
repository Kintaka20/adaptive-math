import jwt from 'jsonwebtoken'
import { env } from '../config/env'

interface JwtPayload {
  userId: string
  role: string
  email: string
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload
}

export const signRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET + '_refresh', {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET + '_refresh') as JwtPayload
}
