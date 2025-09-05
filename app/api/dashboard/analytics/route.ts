import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { categorizeTrafficSource } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

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

    // Получаем параметры фильтрации
    const url = new URL(req.url)
    const period = url.searchParams.get('period') || '30'
    const linkId = url.searchParams.get('linkId')

    // Вычисляем временные рамки
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - parseInt(period))

    // Базовые условия для фильтрации
    const baseWhere = {
      shortLink: {
        userId: user.id
      },
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    // Добавляем фильтр по конкретной ссылке если указан
    if (linkId) {
      Object.assign(baseWhere, { shortLinkId: linkId })
    }

    // Проверяем, есть ли вообще данные в таблице аналитики
    const hasAnalyticsData = await prisma.clickAnalytics.count() > 0

    if (!hasAnalyticsData) {
      // Если нет данных аналитики, возвращаем пустые результаты
      const userLinks = await prisma.shortLink.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          shortId: true,
          originalUrl: true,
          clicks: true
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({
        overview: {
          totalClicks: 0,
          uniqueClicks: 0,
          repeatClicks: 0,
          uniqueRate: 0
        },
        geography: {
          countries: []
        },
        trafficSources: {
          categories: [],
          referers: []
        },
        utm: {
          campaigns: []
        },
        technology: {
          browsers: [],
          devices: []
        },
        timeline: [],
        links: userLinks
      })
    }

    // Получаем все данные параллельно только если есть записи аналитики
    const [
      totalClicks,
      uniqueClicks,
      topCountries,
      topReferers,
      utmCampaigns,
      browserStats,
      deviceStats,
      dailyStats,
      trafficSources
    ] = await Promise.all([
      // Общее количество кликов
      prisma.clickAnalytics.count({
        where: baseWhere
      }).catch(() => 0),

      // Уникальные клики
      prisma.clickAnalytics.count({
        where: { ...baseWhere, isUnique: true }
      }).catch(() => 0),

      // Топ стран
      prisma.clickAnalytics.groupBy({
        by: ['country'],
        where: { ...baseWhere, country: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }).catch(() => []),

      // Топ источников (рефереры)
      prisma.clickAnalytics.groupBy({
        by: ['refererDomain'],
        where: { ...baseWhere, refererDomain: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }).catch(() => []),

      // UTM кампании
      prisma.clickAnalytics.groupBy({
        by: ['utmCampaign', 'utmSource', 'utmMedium'],
        where: { 
          ...baseWhere, 
          OR: [
            { utmCampaign: { not: null } },
            { utmSource: { not: null } },
            { utmMedium: { not: null } }
          ]
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }).catch(() => []),

      // Статистика браузеров
      prisma.clickAnalytics.groupBy({
        by: ['browser'],
        where: { ...baseWhere, browser: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      }).catch(() => []),

      // Статистика устройств
      prisma.clickAnalytics.groupBy({
        by: ['device'],
        where: { ...baseWhere, device: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      }).catch(() => []),

      // Статистика по дням
      prisma.clickAnalytics.findMany({
        where: baseWhere,
        select: {
          createdAt: true,
          isUnique: true
        },
        orderBy: { createdAt: 'desc' }
      }).catch(() => []),

      // Категоризированные источники трафика
      prisma.clickAnalytics.findMany({
        where: baseWhere,
        select: {
          refererDomain: true,
          utmMedium: true
        }
      }).catch(() => [])
    ])

    // Обрабатываем статистику по дням
    const dailyStatsMap = new Map<string, { clicks: number; uniqueClicks: number }>()
    
    dailyStats.forEach(click => {
      const dateKey = click.createdAt.toISOString().split('T')[0]
      const existing = dailyStatsMap.get(dateKey) || { clicks: 0, uniqueClicks: 0 }
      existing.clicks += 1
      if (click.isUnique) {
        existing.uniqueClicks += 1
      }
      dailyStatsMap.set(dateKey, existing)
    })

    const timelineData = Array.from(dailyStatsMap.entries()).map(([date, stats]) => ({
      date,
      clicks: stats.clicks,
      uniqueClicks: stats.uniqueClicks
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Обрабатываем источники трафика
    const trafficSourcesMap = new Map<string, number>()
    trafficSources.forEach(click => {
      const category = categorizeTrafficSource(click.refererDomain, click.utmMedium)
      trafficSourcesMap.set(category, (trafficSourcesMap.get(category) || 0) + 1)
    })

    const trafficSourcesData = Array.from(trafficSourcesMap.entries()).map(([source, count]) => ({
      source,
      count
    })).sort((a, b) => b.count - a.count)

    // Получаем список ссылок пользователя для фильтра
    const userLinks = await prisma.shortLink.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        shortId: true,
        originalUrl: true,
        clicks: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      overview: {
        totalClicks: totalClicks || 0,
        uniqueClicks: uniqueClicks || 0,
        repeatClicks: (totalClicks || 0) - (uniqueClicks || 0),
        uniqueRate: totalClicks > 0 ? Math.round(((uniqueClicks || 0) / totalClicks) * 100) : 0
      },
      geography: {
        countries: (topCountries || []).map(item => ({
          country: item.country || 'Unknown',
          clicks: item._count?.id || 0
        }))
      },
      trafficSources: {
        categories: trafficSourcesData,
        referers: (topReferers || []).map(item => ({
          domain: item.refererDomain || 'Direct',
          clicks: item._count?.id || 0
        }))
      },
      utm: {
        campaigns: (utmCampaigns || []).map(item => ({
          campaign: item.utmCampaign || 'N/A',
          source: item.utmSource || 'N/A',
          medium: item.utmMedium || 'N/A',
          clicks: item._count?.id || 0
        }))
      },
      technology: {
        browsers: (browserStats || []).map(item => ({
          browser: item.browser || 'Unknown',
          clicks: item._count?.id || 0
        })),
        devices: (deviceStats || []).map(item => ({
          device: item.device || 'Unknown',
          clicks: item._count?.id || 0
        }))
      },
      timeline: timelineData,
      links: userLinks
    })
  } catch (e) {
    console.error('Error fetching analytics:', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}