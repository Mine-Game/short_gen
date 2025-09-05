import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { generateId } from '../../../lib/store'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
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

    // Создаем временную ссылку без привязки к пользователю
    // Для этого создадим временного пользователя или используем специальный ID
    const tempUserId = 'temp-user-' + Date.now()

    let shortLink
    try {
      shortLink = await prisma.shortLink.create({
        data: {
          originalUrl: parsed.toString(),
          shortId,
          userId: tempUserId // Временный ID для публичных ссылок
        }
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
