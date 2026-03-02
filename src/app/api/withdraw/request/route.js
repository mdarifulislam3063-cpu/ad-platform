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
    const { amount, method, account } = await request.json()
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (user.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }
    if (amount < 5) {
      return NextResponse.json({ error: 'Minimum withdrawal is $5' }, { status: 400 })
    }

    // পেন্ডিং রেকোয়েস্ট তৈরি (ব্যালেন্স এখনো কাটছি না)
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount,
        method,
        account,
        status: 'pending'
      }
    })

    return NextResponse.json({ success: true, paymentId: payment.id })
  } catch (error) {
    console.error('Withdrawal request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}