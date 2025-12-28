import { NextResponse } from 'next/server'

// POST /api/auth/logout
export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Clear auth cookie
  response.cookies.delete('auth')
  
  return response
}
