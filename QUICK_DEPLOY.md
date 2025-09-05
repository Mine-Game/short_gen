# ⚡ Быстрое развертывание Short Gen

## 🚀 Самый простой способ (5 минут)

### 1. Создайте базу данных
- Перейдите на [neon.tech](https://neon.tech) (бесплатно)
- Зарегистрируйтесь через GitHub
- Создайте новый проект
- Скопируйте `DATABASE_URL`

### 2. Загрузите код на GitHub
```bash
git init
git add .
git commit -m "Deploy Short Gen"
git branch -M main
git remote add origin https://github.com/Mine-Game/short_gen.git
git push -u origin main
```

### 3. Разверните на Vercel
1. Зайдите на [vercel.com](https://vercel.com)
2. Подключите GitHub
3. Выберите репозиторий `short_gen`
4. Добавьте переменные окружения:

```env
DATABASE_URL=postgresql://...  (из Neon)
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=длинный-случайный-ключ-123456
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=пароль-приложения
EMAIL_FROM=your-email@gmail.com
NODE_ENV=production
IP_HASH_SALT=случайная-строка-для-безопасности
```

5. Нажмите **Deploy** 🎉

### 4. Настройте базу данных
После деплоя выполните в терминале Vercel:
```bash
npx prisma db push
```

## ✅ Готово!
Ваше приложение доступно по адресу: `https://your-app.vercel.app`

---

## 🐳 Альтернатива: Docker

Если предпочитаете Docker:

```bash
# Скопируйте и отредактируйте переменные окружения
cp env.production.example .env.production

# Запустите
docker-compose up -d

# Настройте базу данных
docker-compose exec app npx prisma db push
```

Приложение будет доступно на `http://localhost:3000`

---

## 📋 Чек-лист после развертывания

- [ ] Главная страница открывается
- [ ] Регистрация пользователей работает
- [ ] Email подтверждение приходит
- [ ] Создание коротких ссылок работает
- [ ] Переходы по ссылкам работают
- [ ] Аналитика отображается
- [ ] Настройки сохраняются

## 🔧 Решение проблем

**Ошибка базы данных**: Проверьте `DATABASE_URL`
**Ошибка почты**: Проверьте настройки SMTP
**Ошибка 500**: Проверьте логи в панели Vercel

## 📞 Нужна помощь?
Откройте issue в GitHub репозитории проекта.

**Удачного деплоя! 🚀**

## 📋 **Откуда взять переменные окружения:**

### 1. **DATABASE_URL** ✅ (У вас есть!)
```
postgresql://neondb_owner:npg_2HOl5MzIswTV@ep-muddy-dust-ad80eciz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```
**Источник:** Из Neon.tech - вы уже получили этот connection string

### 2. **NEXTAUTH_URL** 🔄 (Получите после деплоя)
```
https://your-app.vercel.app
```
**Что делать:** Сначала поставьте временное значение `https://short-gen.vercel.app`, после деплоя Vercel даст вам реальный URL

### 3. **NEXTAUTH_SECRET** 🔐 (Сгенерируйте)
Выполните в терминале:
```bash
openssl rand -base64 32
```
Или используйте онлайн генератор: [generate-secret.vercel.app](https://generate-secret.vercel.app)

### 4. **EMAIL настройки** 📧 (Ваш Gmail)
```
EMAIL_SERVER_HOST = smtp.gmail.com
EMAIL_SERVER_PORT = 587
EMAIL_SERVER_USER = ваш-реальный-email@gmail.com
EMAIL_FROM = ваш-реальный-email@gmail.com
```

### 5. **EMAIL_SERVER_PASSWORD** 🔑 (Пароль приложения Gmail)
**Как получить:**
1. Зайдите в [myaccount.google.com](https://myaccount.google.com)
2. Безопасность → Двухфакторная аутентификация (включите если нет)
3. Пароли приложений → Создать новый
4. Скопируйте 16-значный пароль

### 6. **NODE_ENV** ✅ (Готово)
```
NODE_ENV = production
```

### 7. **IP_HASH_SALT** 🧂 (Сгенерируйте)
Любая случайная строка:
```
IP_HASH_SALT = my-super-secret-salt-12345
```

## 🚀 **Пример готовых переменных:**
```env
DATABASE_URL = postgresql://neondb_owner:npg_2HOl5MzIswTV@ep-muddy-dust-ad80eciz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEXTAUTH_URL = https://short-gen.vercel.app
NEXTAUTH_SECRET = wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY
EMAIL_SERVER_HOST = smtp.gmail.com
EMAIL_SERVER_PORT = 587
EMAIL_SERVER_USER = atreretrov@gmail.com
EMAIL_FROM = atreretrov@gmail.com
EMAIL_SERVER_PASSWORD = abcd efgh ijkl mnop
NODE_ENV = production
IP_HASH_SALT = my-random-salt-string-2024
```

**Начинайте деплой с временными значениями, потом обновите нужные!** 🎯
