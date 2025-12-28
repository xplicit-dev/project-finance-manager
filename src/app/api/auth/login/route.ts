import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Get settings (contains password)
    let settings = await prisma.settings.findFirst()

    // If no settings exist, create with default password "admin123"
    if (!settings) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      settings = await prisma.settings.create({
        data: {
          currency: 'USD',
          password: hashedPassword,
        },
      })
    }

    // If no password set, set default
    if (!settings.password) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: { password: hashedPassword },
      })
    }

    // Compare password
    const isValid = await bcrypt.compare(password, settings.password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Set HTTP-only cookie
    const response = NextResponse.json({ success: true })
    response.cookies.set('auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
