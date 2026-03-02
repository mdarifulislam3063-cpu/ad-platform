import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { amount, method, phoneNumber } = await request.json()
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // পেমেন্ট রেকর্ড তৈরি করুন
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: parseFloat(amount),
        method: method.toUpperCase(),
        phoneNumber,
        status: 'pending'
      }
    })

    // ইউজারের ব্যালেন্স কমিয়ে দিন
    await prisma.user.update({
      where: { id: user.id },
      data: { balance: { decrement: parseFloat(amount) } }
    })

    return NextResponse.json({
      success: true,
      transaction: {
        id: payment.id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status
      }
    })
  } catch (error) {
    console.error('Withdrawal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}