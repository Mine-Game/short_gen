# 🗄️ Настройка базы данных для продакшена

## 📋 Пошаговая инструкция

### 1. Установите зависимости
```bash
npm install
```

### 2. Получите переменные окружения из Vercel
```bash
npx vercel env pull .env.production --prod
```

### 3. Настройте базу данных
**Вариант A (рекомендуемый):**
```bash
npx dotenv -e .env.production -- npm run db:setup
```

**Вариант B (Windows PowerShell):**
```powershell
Get-Content .env.production | foreach {
  $name,$value = $_ -split '=',2; if ($name) { [Environment]::SetEnvironmentVariable($name,$value,'Process') }
}
npm run db:setup
```

### 4. Проверьте статус миграций
```bash
npx dotenv -e .env.production -- npm run db:status
```

## 🚀 Автоматизация через GitHub Actions

Создайте файл `.github/workflows/migrate.yml`:

```yaml
name: Database Migration

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run database migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}
        run: npm run db:setup
```

## ⚠️ Важные замечания

- **Не добавляйте миграции в build-скрипт** - это может сломать деплой
- **Выполняйте миграции локально** с подключением к продакшен БД
- **Проверяйте статус** перед каждым деплоем
- **Делайте бэкапы** перед миграциями

## 🔧 Команды для управления БД

```bash
# Настройка БД (миграции + генерация клиента)
npm run db:setup

# Проверка статуса миграций
npm run db:status

# Принудительная синхронизация схемы
npm run db:push

# Создание новой миграции
npx prisma migrate dev --name migration_name
```
