import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

// GET /api/ads - Fetch all active ads
export async function GET() {
  try {
    const ads = await prisma.ad.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(ads)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 })
  }
}

// POST /api/ads - Create new ad (admin only)
export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()
    const ad = await prisma.ad.create({
      data: {
        title: data.title,
        videoUrl: data.videoUrl,
        advertiser: data.advertiser,
        costPerView: parseFloat(data.costPerView),
        userShare: parseFloat(data.userShare),
        active: true
      }
    })
    return NextResponse.json(ad)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 })
  }
}