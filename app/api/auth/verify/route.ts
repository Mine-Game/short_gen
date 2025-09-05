import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { consumeEmailVerification } from '@/lib/token'
import { logAudit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    const { email, token } = await req.json()
    if (!email || !token) return NextResponse.json({ error: 'Неверные данные' }, { status: 400 })
    const ok = await consumeEmailVerification(String(email), String(token))
    if (!ok) return NextResponse.json({ error: 'Неверный токен' }, { status: 400 })
    const user = await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } })
    await logAudit('user.verify', { email }, user.id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}



