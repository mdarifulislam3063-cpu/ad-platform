import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, action } = await request.json()
    if (!['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.status !== 'pending') {
      return NextResponse.json({ error: 'Already processed' }, { status: 400 })
    }

    // ট্রানজেকশন শুরু (যাতে দুটি অপারেশন একসাথে হয়)
    const result = await prisma.$transaction(async (tx) => {
      // পেমেন্ট আপডেট
      const updated = await tx.payment.update({
        where: { id },
        data: { status: action }
      })

      // যদি অ্যাপ্রুভ করা হয়, তাহলে ইউজারের ব্যালেন্স কাট
      if (action === 'approved') {
        await tx.user.update({
          where: { id: payment.userId },
          data: { balance: { decrement: payment.amount } }
        })
      }
      // রিজেক্ট করলে কিছু করার নেই (ব্যালেন্স আগে কাটা হয়নি)

      return updated
    })

    return NextResponse.json({ success: true, status: result.status })
  } catch (error) {
    console.error('Admin withdrawal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}