import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // Проверяем аутентификацию
    const session = await getServerSession(authConfig)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем пользователя
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Получаем все ссылки пользователя с сортировкой по дате создания
    const links = await prisma.shortLink.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        originalUrl: true,
        shortId: true,
        clicks: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        utmTerm: true,
        utmContent: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Формируем полные короткие ссылки
    const base = new URL(req.nextUrl.origin)
    const linksWithFullUrl = links.map(link => ({
      ...link,
      shortUrl: `${base.origin}/${link.shortId}`,
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString()
    }))

    return NextResponse.json(linksWithFullUrl)
  } catch (e) {
    console.error('Error fetching user links:', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
