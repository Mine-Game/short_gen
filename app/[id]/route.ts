import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import { 
  hashIP, 
  parseUserAgent, 
  extractDomain, 
  parseUTMParams, 
  isUniqueClick, 
  getClientIP 
} from '../../lib/analytics'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shortId = params.id

    if (!shortId) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Ищем ссылку в базе данных
    const shortLink = await prisma.shortLink.findUnique({
      where: { shortId },
      select: {
        id: true,
        originalUrl: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        utmTerm: true,
        utmContent: true
      }
    })

    if (!shortLink) {
      // Если ссылка не найдена, перенаправляем на главную
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Собираем аналитическую информацию
    const clientIP = getClientIP(request)
    const ipHash = hashIP(clientIP)
    const userAgent = request.headers.get('user-agent') || undefined
    const referer = request.headers.get('referer') || undefined
    
    // Парсим информацию о браузере и устройстве
    const { browser, os, device } = parseUserAgent(userAgent || '')
    
    // Извлекаем домен реферера
    const refererDomain = referer ? extractDomain(referer) : undefined
    
    // Парсим UTM метки из оригинального URL (если они есть)
    const originalUrl = new URL(request.url)
    const utmParams = parseUTMParams(originalUrl.toString())
    
    // Проверяем уникальность клика
    const isUnique = await isUniqueClick(prisma, shortLink.id, ipHash, userAgent)
    
    try {
      // Создаем запись аналитики
      await prisma.clickAnalytics.create({
        data: {
          shortLinkId: shortLink.id,
          ipHash,
          userAgent,
          browser,
          os,
          device,
          referer,
          refererDomain,
          // UTM метки берем из самой ссылки (ShortLink), а не из URL параметров
          utmSource: shortLink.utmSource,
          utmMedium: shortLink.utmMedium,
          utmCampaign: shortLink.utmCampaign,
          utmTerm: shortLink.utmTerm,
          utmContent: shortLink.utmContent,
          isUnique
        }
      })
      
      // Увеличиваем счетчик переходов
      await prisma.shortLink.update({
        where: { id: shortLink.id },
        data: { clicks: { increment: 1 } }
      })
    } catch (e) {
      console.error('Failed to save analytics or increment clicks:', e)
      // Продолжаем выполнение даже если не удалось сохранить аналитику
    }

    // Формируем финальный URL с UTM параметрами если они есть
    let finalUrl = shortLink.originalUrl
    
    try {
      const originalURL = new URL(shortLink.originalUrl)
      
      // Добавляем UTM параметры из ссылки, если они есть
      if (shortLink.utmSource) originalURL.searchParams.set('utm_source', shortLink.utmSource)
      if (shortLink.utmMedium) originalURL.searchParams.set('utm_medium', shortLink.utmMedium)
      if (shortLink.utmCampaign) originalURL.searchParams.set('utm_campaign', shortLink.utmCampaign)
      if (shortLink.utmTerm) originalURL.searchParams.set('utm_term', shortLink.utmTerm)
      if (shortLink.utmContent) originalURL.searchParams.set('utm_content', shortLink.utmContent)
      
      finalUrl = originalURL.toString()
    } catch (e) {
      console.error('Error adding UTM parameters:', e)
      // Если не удалось обработать URL, используем оригинальный
      finalUrl = shortLink.originalUrl
    }

    // Перенаправляем на финальный URL
    return NextResponse.redirect(finalUrl)
  } catch (e) {
    console.error('Error handling short link:', e)
    // В случае ошибки перенаправляем на главную
    return NextResponse.redirect(new URL('/', request.url))
  }
}


