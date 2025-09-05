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

    // Получаем статистику
    const [totalLinks, totalClicks, todayClicks] = await Promise.all([
      // Общее количество ссылок
      prisma.shortLink.count({
        where: { userId: user.id }
      }),
      
      // Общее количество переходов
      prisma.shortLink.aggregate({
        where: { userId: user.id },
        _sum: { clicks: true }
      }),
      
      // Переходы за сегодня
      prisma.shortLink.aggregate({
        where: { 
          userId: user.id,
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        _sum: { clicks: true }
      })
    ])

    return NextResponse.json({
      totalLinks,
      totalClicks: totalClicks._sum.clicks || 0,
      todayClicks: todayClicks._sum.clicks || 0
    })
  } catch (e) {
    console.error('Error fetching dashboard stats:', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
