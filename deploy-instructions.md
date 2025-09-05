# 🚀 Пошаговая инструкция по развертыванию

## Быстрый старт с Vercel (15 минут)

### 1. Подготовка базы данных

**Вариант A: Neon PostgreSQL (Рекомендуется - Бесплатно)**
1. Перейдите на [neon.tech](https://neon.tech)
2. Создайте аккаунт через GitHub
3. Создайте новый проект
4. Скопируйте connection string (начинается с `postgresql://`)

**Вариант B: Vercel Postgres (Простой, но платный после лимитов)**
1. В панели Vercel перейдите в Storage
2. Создайте Postgres базу
3. Скопируйте connection string

### 2. Загрузка кода в GitHub

```bash
# В папке вашего проекта
git init
git add .
git commit -m "Initial deployment"
git branch -M main

# Создайте репозиторий на GitHub, затем:
git remote add origin https://github.com/ваш-username/short_gen.git
git push -u origin main
```

### 3. Развертывание на Vercel

1. **Перейдите на [vercel.com](https://vercel.com)**
2. **Войдите через GitHub**
3. **Нажмите "New Project"**
4. **Выберите репозиторий `short_gen`**
5. **Настройте переменные окружения:**

   Нажмите "Environment Variables" и добавьте:

   ```
   DATABASE_URL = ваш_postgresql_connection_string
   NEXTAUTH_URL = https://ваш-проект.vercel.app
   NEXTAUTH_SECRET = сгенерируйте_длинный_случайный_ключ
   EMAIL_SERVER_HOST = smtp.gmail.com
   EMAIL_SERVER_PORT = 587
   EMAIL_SERVER_USER = ваш-email@gmail.com
   EMAIL_SERVER_PASSWORD = пароль_приложения_gmail
   EMAIL_FROM = ваш-email@gmail.com
   NODE_ENV = production
   IP_HASH_SALT = случайная_строка_для_безопасности
   ```

6. **Нажмите "Deploy"**

### 4. Первая настройка базы данных

После успешного деплоя:

1. Перейдите в панель Vercel -> ваш проект -> Functions
2. В терминале выполните (или через Vercel CLI):
```bash
npx vercel exec -- npx prisma db push
```

### 5. Получение домена

- Автоматически: `https://ваш-проект.vercel.app`
- Кастомный домен: Настройки -> Domains в панели Vercel

## Альтернативные варианты

### Railway.app
- Простое развертывание одной кнопкой
- Встроенная PostgreSQL
- Хороший бесплатный план

### Netlify
- Отличная интеграция с GitHub
- Требует внешнюю базу данных

### DigitalOcean App Platform
- Больше контроля
- Встроенные базы данных

## Проверка работы

После деплоя проверьте:
1. ✅ Главная страница загружается
2. ✅ Регистрация работает
3. ✅ Создание коротких ссылок
4. ✅ Переходы по ссылкам
5. ✅ Аналитика

## Решение проблем

**Ошибка сборки:**
- Проверьте что все зависимости установлены
- Убедитесь что `prisma generate` выполняется

**Ошибка базы данных:**
- Проверьте connection string
- Убедитесь что база доступна из интернета

**Ошибки аутентификации:**
- Проверьте NEXTAUTH_URL
- Убедитесь что NEXTAUTH_SECRET достаточно длинный

## Мониторинг

- Логи: Панель Vercel -> Functions -> View Function Logs
- Аналитика: Включите Vercel Analytics
- Uptime: Используйте UptimeRobot или подобные сервисы

---

**Готово! Ваше приложение доступно всему миру 🎉**
