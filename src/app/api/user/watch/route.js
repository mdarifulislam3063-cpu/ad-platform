// app/api/user/watch/route.js
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { adId } = await req.json()

  // ইউজার ইতিমধ্যে এই বিজ্ঞাপন দেখেছে কিনা চেক করুন (ঐচ্ছিক, প্রতারণা রোধে)
  const existing = await prisma.adView.findFirst({
    where: { userId: session.user.id, adId }
  })
  if (existing) {
    return NextResponse.json({ error: 'Already watched this ad' }, { status: 400 })
  }

  const ad = await prisma.ad.findUnique({ where: { id: adId } })
  if (!ad) {
    return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
  }

  // ট্রানজেকশনে ভিউ রেকর্ড ও ব্যালেন্স আপডেট
  const result = await prisma.$transaction([
    prisma.adView.create({
      data: {
        userId: session.user.id,
        adId: ad.id,
        ip: req.headers.get('x-forwarded-for') || null,
        userAgent: req.headers.get('user-agent') || null
      }
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { balance: { increment: ad.userShare } }
    })
  ])

  return NextResponse.json({ success: true, earned: ad.userShare })
}