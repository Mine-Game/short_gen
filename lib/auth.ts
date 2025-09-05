import NextAuth, { DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { verifyPassword } from './password'
import type { NextAuthOptions } from 'next-auth'
import { z } from 'zod'
import { hashIp } from './token'
import { logAudit } from './audit'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: DefaultSession['user'] & { id: string; role: string }
  }
}

const signInSchema = z.object({ email: z.string().email(), password: z.string().min(6) })

export const authConfig: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  providers: [
    Credentials({
      name: 'email-password',
      credentials: { email: {}, password: {} },
      async authorize(raw, request) {
        console.log('NextAuth authorize called with:', { email: raw?.email })
        
        const parsed = signInSchema.safeParse(raw)
        if (!parsed.success) {
          console.log('Schema validation failed:', parsed.error)
          return null
        }
        const { email, password } = parsed.data

        // Упрощаем IP получение для NextAuth v4
        const ipHash = hashIp('development-ip')

        // brute-force check: last 15 min >=5 failures (упрощенная версия)
        const since = new Date(Date.now() - 15 * 60_000)
        const fails = await prisma.failedLogin.count({ where: { email, ipHash, attemptedAt: { gte: since } } })
        if (fails >= 5) return null

        const user = await prisma.user.findUnique({ where: { email } })
        console.log('User found:', { id: user?.id, email: user?.email, hasPassword: !!user?.passwordHash, emailVerified: user?.emailVerified })
        
        if (!user || !user.passwordHash) {
          console.log('User not found or no password hash')
          await prisma.failedLogin.create({ data: { email, ipHash } })
          await logAudit('auth.signin.fail', { email })
          return null
        }
        
        // Проверяем emailVerified только если это не null
        if (user.emailVerified === null) {
          console.log('Email not verified')
          await prisma.failedLogin.create({ data: { email, ipHash } })
          await logAudit('auth.signin.fail', { email })
          return null
        }
        
        const ok = await verifyPassword(user.passwordHash, password)
        console.log('Password verification result:', ok)
        
        if (!ok) {
          console.log('Password verification failed')
          await prisma.failedLogin.create({ data: { email, ipHash } })
          await logAudit('auth.signin.fail', { email })
          return null
        }
        
        console.log('Login successful for user:', user.email)
        await logAudit('auth.signin.success', { email }, user.id)
        return { id: user.id, email: user.email, name: user.email }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
        
        // Получаем роль из базы данных
        try {
          const user = await prisma.user.findUnique({ 
            where: { id: token.id },
            select: { role: true }
          })
          session.user.role = user?.role ?? 'user'
        } catch (error) {
          session.user.role = 'user'
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/error',
  },
}

// Экспортируем только конфигурацию для NextAuth v4
// handlers, auth, signIn, signOut будут созданы в API маршруте

// Функция для входа пользователя
export async function loginUser(email: string, password: string) {
  try {
    // Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user || !user.passwordHash) {
      return { ok: false, error: 'Invalid credentials' }
    }
    
    // Проверяем emailVerified только если это не null
    if (user.emailVerified === null) {
      return { ok: false, error: 'Email not verified' }
    }
    
    // Проверяем пароль
    const { verifyPassword } = await import('./password')
    const isValidPassword = await verifyPassword(user.passwordHash, password)
    
    if (!isValidPassword) {
      return { ok: false, error: 'Invalid credentials' }
    }
    
    return { ok: true, user: { id: user.id, email: user.email } }
  } catch (error) {
    console.log('Login error:', error)
    return { ok: false, error: 'Login failed' }
  }
}

// Функция для регистрации пользователя
export async function register(email: string, password: string) {
  try {
    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return { ok: false, error: 'User already exists' }
    }
    
    // Хэшируем пароль
    const { hashPassword } = await import('./password')
    const passwordHash = await hashPassword(password)
    
    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        emailVerified: new Date(), // В режиме разработки сразу подтверждаем email
      }
    })
    
    // Отправляем письмо подтверждения (опционально для разработки)
    // В режиме разработки отключаем отправку email
    console.log('Email verification skipped in development mode')
    
    await logAudit('auth.register.success', { email }, user.id)
    
    return { ok: true }
  } catch (error) {
    await logAudit('auth.register.fail', { email })
    return { ok: false, error: 'Registration failed' }
  }
}
