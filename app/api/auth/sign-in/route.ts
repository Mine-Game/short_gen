import { NextRequest, NextResponse } from 'next/server'
import { loginUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    
    const res = await loginUser(String(email), String(password))
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 401 })
    return NextResponse.json({ ok: true, message: 'Login successful' })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
