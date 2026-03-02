import { PrismaClient } from '@prisma/client'

const globalForPrisma = global

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // ডেভেলপমেন্টে কোয়েরি লগ দেখতে চাইলে
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma