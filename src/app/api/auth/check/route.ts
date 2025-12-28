import { NextRequest, NextResponse } from 'next/server'

// GET /api/auth/check
export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('auth')
  
  return NextResponse.json({
    authenticated: authCookie?.value === 'authenticated'
  })
}
