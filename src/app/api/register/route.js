import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    const { name, email, password } = await req.json()

    // ভ্যালিডেশন
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    // ইমেইল ইউনিক কিনা চেক করুন
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // পাসওয়ার্ড হ্যাশ করুন
    const hashedPassword = await bcrypt.hash(password, 10)

    // ইউজার তৈরি করুন
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        role: 'user' // ডিফল্ট রোল
      }
    })

    // পাসওয়ার্ড বাদ দিয়ে ইউজার অবজেক্ট রিটার্ন করুন
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}