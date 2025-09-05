import crypto from 'crypto'

// Интерфейс для данных аналитики клика
export interface ClickData {
  ipHash: string
  userAgent?: string
  browser?: string
  os?: string
  device?: string
  referer?: string
  refererDomain?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  country?: string
  city?: string
  region?: string
  isUnique: boolean
}

// Хэширование IP-адреса для анонимности
export function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.IP_HASH_SALT || 'default-salt').digest('hex')
}

// Парсинг User-Agent для извлечения информации о браузере, ОС и устройстве
export function parseUserAgent(userAgent: string): { browser?: string; os?: string; device?: string } {
  if (!userAgent) return {}
  
  const ua = userAgent.toLowerCase()
  
  // Определяем браузер
  let browser: string | undefined
  if (ua.includes('chrome') && !ua.includes('edg') && !ua.includes('opr')) {
    browser = 'Chrome'
  } else if (ua.includes('firefox')) {
    browser = 'Firefox'
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari'
  } else if (ua.includes('edg')) {
    browser = 'Edge'
  } else if (ua.includes('opr') || ua.includes('opera')) {
    browser = 'Opera'
  } else if (ua.includes('trident') || ua.includes('msie')) {
    browser = 'Internet Explorer'
  }
  
  // Определяем ОС
  let os: string | undefined
  if (ua.includes('windows')) {
    os = 'Windows'
  } else if (ua.includes('macintosh') || ua.includes('mac os x')) {
    os = 'macOS'
  } else if (ua.includes('linux')) {
    os = 'Linux'
  } else if (ua.includes('android')) {
    os = 'Android'
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    os = 'iOS'
  }
  
  // Определяем тип устройства
  let device: string | undefined
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || ua.includes('ipod')) {
    device = 'mobile'
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    device = 'tablet'
  } else {
    device = 'desktop'
  }
  
  return { browser, os, device }
}

// Извлечение домена из URL
export function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace('www.', '')
  } catch {
    return null
  }
}

// Парсинг UTM меток из URL
export function parseUTMParams(url: string): {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
} {
  try {
    const parsed = new URL(url)
    const params = parsed.searchParams
    
    return {
      utmSource: params.get('utm_source') || undefined,
      utmMedium: params.get('utm_medium') || undefined,
      utmCampaign: params.get('utm_campaign') || undefined,
      utmTerm: params.get('utm_term') || undefined,
      utmContent: params.get('utm_content') || undefined,
    }
  } catch {
    return {}
  }
}

// Определение уникальности клика
export async function isUniqueClick(
  prisma: any,
  shortLinkId: string,
  ipHash: string,
  userAgent: string | undefined,
  timeWindowHours: number = 24
): Promise<boolean> {
  const timeThreshold = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000)
  
  const existingClick = await prisma.clickAnalytics.findFirst({
    where: {
      shortLinkId,
      ipHash,
      userAgent,
      createdAt: {
        gte: timeThreshold
      }
    }
  })
  
  return !existingClick
}

// Получение IP-адреса из запроса (с учетом прокси)
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const clientIP = request.headers.get('x-client-ip')
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  return realIP || clientIP || '127.0.0.1'
}

// Категоризация источников трафика
export function categorizeTrafficSource(refererDomain: string | null, utmMedium: string | null): string {
  if (!refererDomain && !utmMedium) return 'Direct'
  
  if (utmMedium) {
    switch (utmMedium.toLowerCase()) {
      case 'email':
        return 'Email'
      case 'social':
        return 'Social Media'
      case 'cpc':
      case 'ppc':
        return 'Paid Search'
      case 'organic':
        return 'Organic Search'
      case 'referral':
        return 'Referral'
      default:
        return 'Other'
    }
  }
  
  if (refererDomain) {
    // Социальные сети
    const socialDomains = ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'youtube.com', 'tiktok.com', 'vk.com', 'telegram.org']
    if (socialDomains.some(domain => refererDomain.includes(domain))) {
      return 'Social Media'
    }
    
    // Поисковые системы
    const searchDomains = ['google.com', 'bing.com', 'yahoo.com', 'yandex.ru', 'duckduckgo.com']
    if (searchDomains.some(domain => refererDomain.includes(domain))) {
      return 'Organic Search'
    }
    
    // Мессенджеры (часто показываются как t.co для Twitter, l.facebook.com для Facebook и т.д.)
    const messengerDomains = ['t.co', 'l.facebook.com', 'l.instagram.com', 'out.reddit.com']
    if (messengerDomains.some(domain => refererDomain.includes(domain))) {
      return 'Messengers'
    }
    
    return 'Referral'
  }
  
  return 'Other'
}
