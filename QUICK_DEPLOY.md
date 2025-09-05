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
git remote add origin https://github.com/your-username/short_gen.git
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
