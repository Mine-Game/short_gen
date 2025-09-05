import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Проверяем аутентификацию
    const session = await getServerSession(authConfig)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const linkId = params.id

    // Получаем пользователя
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Проверяем, что ссылка принадлежит пользователю
    const link = await prisma.shortLink.findFirst({
      where: {
        id: linkId,
        userId: user.id
      }
    })

    if (!link) {
      return NextResponse.json({ error: 'Link not found or access denied' }, { status: 404 })
    }

    // Удаляем ссылку
    await prisma.shortLink.delete({
      where: { id: linkId }
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Error deleting link:', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
