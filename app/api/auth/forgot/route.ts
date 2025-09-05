import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { issuePasswordReset } from '@/lib/token'
import { sendMail } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Неверные данные' }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { email: String(email) } })
    if (user) {
      const token = await issuePasswordReset(user.id)
      const url = `${process.env.APP_BASE_URL}/auth/reset?token=${token}`
      await sendMail(String(email), 'Сброс пароля', `<p>Сменить пароль: <a href="${url}">Открыть</a></p>`)
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}



