import { NextRequest, NextResponse } from 'next/server'
import { consumePasswordReset } from '@/lib/token'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { logAudit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) return NextResponse.json({ error: 'Неверные данные' }, { status: 400 })
    const userId = await consumePasswordReset(String(token))
    if (!userId) return NextResponse.json({ error: 'Неверный или просроченный токен' }, { status: 400 })
    const passwordHash = await hashPassword(String(password))
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
    // invalidate all sessions
    await prisma.session.deleteMany({ where: { userId } })
    await logAudit('user.password.reset', null, userId)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}



