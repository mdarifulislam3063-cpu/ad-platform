import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword)
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10)
}
