// Скрипт для восстановления UTM функциональности после миграции
// Запустите этот скрипт ПОСЛЕ успешного выполнения npx prisma db push

const fs = require('fs');
const path = require('path');

const files = [
  {
    path: 'app/api/dashboard/links/route.ts',
    search: `select: {
        id: true,
        originalUrl: true,
        shortId: true,
        clicks: true,
        createdAt: true,
        updatedAt: true
      }`,
    replace: `select: {
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
      }`
  },
  {
    path: 'app/api/shorten/route.ts',
    search: `shortLink = await prisma.shortLink.create({
        data: {
          originalUrl: parsed.toString(),
          shortId,
          userId: user.id
        }
      })`,
    replace: `const linkData = {
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
      })`
  },
  {
    path: 'app/[id]/route.ts',
    search: `const shortLink = await prisma.shortLink.findUnique({
      where: { shortId }
    })`,
    replace: `const shortLink = await prisma.shortLink.findUnique({
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
    })`
  },
  {
    path: 'app/[id]/route.ts',
    search: `// Перенаправляем на оригинальный URL (UTM поддержка будет добавлена после миграции)
    return NextResponse.redirect(shortLink.originalUrl)`,
    replace: `// Формируем финальный URL с UTM параметрами если они есть
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
    return NextResponse.redirect(finalUrl)`
  }
];

console.log('🔄 Restoring UTM functionality...');

files.forEach(({ path: filePath, search, replace }) => {
  try {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    if (content.includes(search)) {
      const newContent = content.replace(search, replace);
      fs.writeFileSync(fullPath, newContent);
      console.log(`✅ Updated ${filePath}`);
    } else {
      console.log(`⚠️ Pattern not found in ${filePath} - file may already be updated`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
});

console.log('✅ UTM functionality restored! Please restart your development server.');
