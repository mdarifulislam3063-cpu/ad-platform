import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, sourceType, videoUrl, videoType, advertiser, costPerView, userShare, adTagUrl, active } = body

    // Enhanced validation with clear error messages
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (sourceType === 'DIRECT') {
      if (!videoUrl || !advertiser || !costPerView || !userShare) {
        return NextResponse.json({ 
          error: 'Missing required fields for direct ad: videoUrl, advertiser, costPerView, userShare' 
        }, { status: 400 })
      }
    } else if (sourceType === 'EXOCLICK') {
      if (!adTagUrl) {
        return NextResponse.json({ error: 'Ad Tag URL is required for ExoClick ad' }, { status: 400 })
      }
      // Validate URL format (optional but helpful)
      try {
        new URL(adTagUrl)
      } catch (e) {
        return NextResponse.json({ error: 'Invalid Ad Tag URL format' }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: 'Invalid source type' }, { status: 400 })
    }

    // Create ad in database
    const ad = await prisma.ad.create({
      data: {
        title,
        sourceType,
        videoUrl: videoUrl || null,
        videoType: videoType || null,
        advertiser: advertiser || null,
        costPerView: costPerView ? parseFloat(costPerView) : null,
        userShare: userShare ? parseFloat(userShare) : null,
        adTagUrl: adTagUrl || null,
        active: active ?? true,
      }
    })

    return NextResponse.json(ad, { status: 201 })
  } catch (error) {
    console.error('Detailed error in ad creation:', error)
    // Send more detailed error in development, generic in production
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}