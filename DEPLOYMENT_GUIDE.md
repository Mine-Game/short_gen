# 🚀 Руководство по развертыванию Short Gen

## Варианты развертывания

### 1. Vercel + Neon PostgreSQL (Рекомендуемый)

#### Шаг 1: Подготовка базы данных

1. **Создайте бесплатную PostgreSQL базу на Neon:**
   - Перейдите на [neon.tech](https://neon.tech)
   - Создайте аккаунт и новый проект
   - Скопируйте connection string

2. **Обновите schema.prisma для PostgreSQL:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. **Создайте файл для миграции базы:**
```bash
npx prisma migrate deploy
npx prisma generate
```

#### Шаг 2: Настройка переменных окружения

Создайте файл `.env.production` со следующими переменными:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"

# NextAuth.js
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-very-long-random-secret-key-for-production"

# Email (настройте SMTP)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"

# Production settings
NODE_ENV="production"

# Analytics
IP_HASH_SALT="your-random-salt-for-ip-hashing-security"
```

#### Шаг 3: Развертывание на Vercel

1. **Загрузите код в GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/short_gen.git
git push -u origin main
```

2. **Подключите к Vercel:**
   - Зайдите на [vercel.com](https://vercel.com)
   - Нажмите "New Project"
   - Выберите ваш GitHub репозиторий
   - В разделе "Environment Variables" добавьте все переменные из `.env.production`

3. **Настройте команды сборки (если нужно):**
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Start Command: `npm start`

### 2. Railway (Альтернатива)

Railway предоставляет простое развертывание с встроенной PostgreSQL:

1. Зайдите на [railway.app](https://railway.app)
2. Подключите GitHub репозиторий
3. Добавьте PostgreSQL сервис
4. Настройте переменные окружения

### 3. Netlify

Netlify также поддерживает Next.js:

1. Зайдите на [netlify.com](https://netlify.com)
2. Подключите GitHub репозиторий
3. Настройте build команды
4. Используйте внешнюю PostgreSQL базу

## Подготовка к развертыванию

### 1. Обновление Prisma schema

Обновите `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Добавьте скрипты в package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate",
    "db:migrate": "prisma migrate deploy",
    "db:seed": "node prisma/seed.js"
  }
}
```

### 3. Создайте vercel.json (опционально)

```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install"
}
```

## Миграция данных

Если у вас уже есть данные в SQLite:

1. **Экспорт данных из SQLite:**
```bash
npx prisma studio # Откройте студию и экспортируйте данные
```

2. **Импорт в PostgreSQL:**
```bash
# После настройки PostgreSQL
npx prisma migrate deploy
# Импортируйте данные вручную или создайте seed скрипт
```

## Безопасность для продакшена

1. **Обновите NEXTAUTH_SECRET:**
   - Сгенерируйте новый секретный ключ: `openssl rand -base64 32`

2. **Настройте CORS и домены:**
   - Обновите NEXTAUTH_URL на ваш продакшен домен

3. **Настройте rate limiting и CAPTCHA (рекомендуется)**

## Мониторинг

1. **Vercel Analytics:** Включите в настройках проекта
2. **Логи:** Просматривайте в панели Vercel
3. **Uptime monitoring:** Используйте сервисы типа UptimeRobot

## Домен

1. **Vercel домен:** Автоматически получите `your-app.vercel.app`
2. **Кастомный домен:** Добавьте в настройках Vercel

## Поддержка и обслуживание

- Регулярно обновляйте зависимости
- Мониторьте логи ошибок
- Делайте резервные копии базы данных
- Следите за использованием ресурсов

---

**Нужна помощь?** Обратитесь к документации:
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
