"use client"
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const menuItems = [
    {
      href: '/dashboard',
      label: 'Дашборд',
      icon: '🏠'
    },
    {
      href: '/dashboard/create',
      label: 'Создать ссылку',
      icon: '➕'
    },
    {
      href: '/dashboard/links',
      label: 'Все мои ссылки',
      icon: '🔗'
    },
    {
      href: '/dashboard/stats',
      label: 'Статистика',
      icon: '📊'
    },
    {
      href: '/dashboard/settings',
      label: 'Настройки',
      icon: '⚙️'
    }
  ]

  async function logout() {
    await signOut({ 
      callbackUrl: '/auth/sign-in',
      redirect: true 
    })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Боковое меню */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800">ShortGen Admin</h2>
            {session?.user?.email && (
              <p className="text-sm text-gray-600 mt-1">{session.user.email}</p>
            )}
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
            >
              <span className="text-lg">🚪</span>
              Выйти
            </button>
          </div>
        </div>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
