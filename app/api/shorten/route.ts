import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateId } from '@/lib/store'

export async function POST(req: NextRequest) {
  try {
    // Проверяем аутентификацию
    const session = await getServerSession(authConfig)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url, utmParams } = await req.json()
    if (typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    const cleaned = url.trim()
    const withScheme = /^(https?:)?\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`
    
    let parsed: URL
    try {
      parsed = new URL(withScheme)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    // Получаем пользователя
    let user
    try {
      user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
    } catch (e) {
      console.error('Database error:', e)
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Генерируем уникальный ID
    let shortId: string
    let attempts = 0
    const maxAttempts = 10

    do {
      shortId = generateId(7)
      attempts++
      if (attempts > maxAttempts) {
        return NextResponse.json({ error: 'Failed to generate unique ID' }, { status: 500 })
      }
      
      try {
        const existing = await prisma.shortLink.findUnique({ where: { shortId } })
        if (!existing) break
      } catch (e) {
        console.error('Database error during ID check:', e)
        return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
      }
    } while (true)

    // Сохраняем ссылку в базу данных
    let shortLink
    try {
      const linkData: any = {
        originalUrl: parsed.toString(),
        shortId,
        userId: user.id
      }

      // Добавляем UTM параметры если они есть
      if (utmParams && typeof utmParams === 'object') {
        if (utmParams.utm_source) linkData.utmSource = utmParams.utm_source
        if (utmParams.utm_medium) linkData.utmMedium = utmParams.utm_medium
        if (utmParams.utm_campaign) linkData.utmCampaign = utmParams.utm_campaign
        if (utmParams.utm_term) linkData.utmTerm = utmParams.utm_term
        if (utmParams.utm_content) linkData.utmContent = utmParams.utm_content
      }

      shortLink = await prisma.shortLink.create({
        data: linkData
      })
    } catch (e) {
      console.error('Failed to create short link:', e)
      return NextResponse.json({ error: 'Failed to save link to database' }, { status: 500 })
    }

    const base = new URL(req.nextUrl.origin)
    const short = `${base.origin}/${shortId}`

    return NextResponse.json({ 
      id: shortLink.id, 
      short, 
      target: parsed.toString(),
      shortId,
      clicks: 0,
      createdAt: shortLink.createdAt
    })
  } catch (e) {
    console.error('Error creating short link:', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


