# Short Gen

Next.js (App Router, TypeScript) + Tailwind CSS + shadcn/ui baseline.

## Установка

```bash
npm install
```

## Режим разработки

```bash
npm run dev
```

Откройте `http://localhost:3000`.

## Продакшен сборка

```bash
npm run build
npm start
```

## Структура

- `app/` — App Router, страницы `/` и `/dashboard`
- `app/layout.tsx` — общий макет с шапкой
- `tailwind.config.ts`, `postcss.config.js`, `app/globals.css` — Tailwind
- `components/ui/` — базовые UI-компоненты (shadcn-подход)
- `lib/utils.ts` — `cn()` для классов

## Заметки по shadcn/ui

В проект добавлен утилитарный подход (`cn`, cva). При желании можно установить CLI:

```bash
npx shadcn-ui@latest init --yes
```

И добавлять компоненты, например:

```bash
npx shadcn-ui@latest add button
```

## Авторизация на внутренней БД

1) Установите переменные окружения в `.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"
AUTH_SECRET="<случайная-строка>"
EMAIL_FROM="no-reply@mydomain.ru"
SMTP_HOST="smtp.mydomain.ru"
SMTP_PORT=587
SMTP_USER="smtp-user"
SMTP_PASS="smtp-pass"
APP_BASE_URL="http://localhost:3000"
```

2) Prisma миграции:

```bash
npx prisma migrate dev -n "auth-internal"
```

3) Запуск dev:

```bash
npm run dev
```

Потоки:
- Регистрация: POST `/api/auth/sign-up` → письмо подтверждения на `/auth/verify`.
- Вход: страница `/auth/sign-in` (NextAuth Credentials); блокировка при 5 ошибках за 15 минут.
- Восстановление: `/auth/forgot` → письмо со ссылкой `/auth/reset`.
- Защита: `middleware.ts` редиректит неавторизованных с `/dashboard` на `/auth/sign-in`.

