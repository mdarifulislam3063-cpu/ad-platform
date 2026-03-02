import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const BINANCE_API_URL = 'https://bpay.binanceapi.com'
const BINANCE_MERCHANT_API_KEY = process.env.BINANCE_MERCHANT_API_KEY
const BINANCE_MERCHANT_SECRET_KEY = process.env.BINANCE_MERCHANT_SECRET_KEY

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { amount, userId } = await request.json()

    // ইউনিক ট্রেড নম্বর তৈরি করুন
    const merchantTradeNo = `AD${Date.now()}${Math.floor(Math.random() * 1000)}`

    // Binance Pay API পে লোড
    const payload = {
      env: {
        terminalType: 'WEB' // ওয়েব অ্যাপ্লিকেশন
      },
      merchantTradeNo: merchantTradeNo,
      orderAmount: amount,
      currency: 'USDT',
      description: 'Withdrawal from AdPlatform',
      returnUrl: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/dashboard?payment=cancelled`,
      webhookUrl: `${process.env.NEXTAUTH_URL}/api/binance/webhook`
    }

    // সিগনেচার তৈরি
    const timestamp = Date.now().toString()
    const nonce = crypto.randomBytes(16).toString('hex')
    const signaturePayload = timestamp + '\n' + nonce + '\n' + JSON.stringify(payload) + '\n'
    const signature = crypto
      .createHmac('sha512', BINANCE_MERCHANT_SECRET_KEY)
      .update(signaturePayload)
      .digest('hex')
      .toUpperCase()

    // Binance API কল
    const response = await fetch(`${BINANCE_API_URL}/binancepay/openapi/v2/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'BinancePay-Timestamp': timestamp,
        'BinancePay-Nonce': nonce,
        'BinancePay-Certificate-SN': BINANCE_MERCHANT_API_KEY,
        'BinancePay-Signature': signature
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (data.status === 'SUCCESS') {
      // আপনার ডাটাবেজে পেমেন্ট রেকর্ড তৈরি করুন
      await prisma.payment.create({
        data: {
          userId: userId,
          amount: amount,
          method: 'BINANCE_PAY',
          prepayId: data.data.prepayId,
          merchantTradeNo: merchantTradeNo,
          currency: 'USDT',
          status: 'INITIAL'
        }
      })

      return NextResponse.json({
        checkoutUrl: data.data.checkoutUrl,
        prepayId: data.data.prepayId
      })
    } else {
      return NextResponse.json({ error: data.errorMessage }, { status: 400 })
    }

  } catch (error) {
    console.error('Binance Pay error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}