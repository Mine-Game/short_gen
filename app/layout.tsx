import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { Inter } from 'next/font/google'
import AuthSessionProvider from '../components/SessionProvider'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Short Gen',
  description: 'Next.js scaffold with Tailwind and shadcn/ui',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} min-h-dvh bg-white text-gray-900`}> 
        <header className="border-b">
          <div className="container mx-auto flex items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold">ShortGen</Link>
            <nav className="flex items-center gap-4">
              <Link href="/" className="hover:underline">Главная</Link>
              <Link href="/dashboard" className="hover:underline">Кабинет</Link>
            </nav>
          </div>
        </header>
        <AuthSessionProvider>
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
        </AuthSessionProvider>
      </body>
    </html>
  )
}

