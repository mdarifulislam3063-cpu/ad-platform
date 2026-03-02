import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const BINANCE_MERCHANT_SECRET_KEY = process.env.BINANCE_MERCHANT_SECRET_KEY

export async function POST(request) {
  try {
    const body = await request.text()
    const headers = request.headers

    // সিগনেচার ভেরিফাই করুন
    const timestamp = headers.get('Binancepay-Timestamp')
    const nonce = headers.get('Binancepay-Nonce')
    const signature = headers.get('Binancepay-Signature')

    const payload = timestamp + '\n' + nonce + '\n' + body + '\n'
    const expectedSignature = crypto
      .createHmac('sha512', BINANCE_MERCHANT_SECRET_KEY)
      .update(payload)
      .digest('base64')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)
    const { bizStatus, data } = event

    // পেমেন্ট স্টেটাস আপডেট করুন
    if (data.prepayId) {
      const payment = await prisma.payment.findFirst({
        where: { prepayId: data.prepayId }
      })

      if (payment) {
        let newStatus = 'PENDING'
        if (bizStatus === 'PAY_SUCCESS' || bizStatus === 'PAY_FINISH') {
          newStatus = 'PAID'
          // ইউজারের ব্যালেন্স আপডেট করুন
          await prisma.user.update({
            where: { id: payment.userId },
            data: { balance: { increment: payment.amount } }
          })
        } else if (bizStatus === 'PAY_CLOSED') {
          newStatus = 'EXPIRED'
        }

        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: newStatus }
        })
      }
    }

    return new NextResponse('SUCCESS', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}