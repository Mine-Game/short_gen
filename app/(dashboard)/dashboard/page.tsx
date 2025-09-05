"use client"
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface DashboardStats {
  totalLinks: number
  totalClicks: number
  todayClicks: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalLinks: 0,
    totalClicks: 0,
    todayClicks: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (e) {
        console.error('Failed to fetch stats:', e)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchStats()
    }
  }, [session])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Дашборд</h1>
        <p className="text-gray-600">Добро пожаловать в панель управления ShortGen</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Всего ссылок</h3>
          <p className="text-3xl font-bold text-blue-600">
            {loading ? '...' : stats.totalLinks}
          </p>
        </div>
        
        <div className="rounded-xl border bg-white p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Переходы</h3>
          <p className="text-3xl font-bold text-green-600">
            {loading ? '...' : stats.totalClicks}
          </p>
        </div>
        
        <div className="rounded-xl border bg-white p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Сегодня</h3>
          <p className="text-3xl font-bold text-purple-600">
            {loading ? '...' : stats.todayClicks}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Быстрые действия</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <a href="/dashboard/create" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <span className="text-2xl">➕</span>
            <div>
              <h4 className="font-medium">Создать ссылку</h4>
              <p className="text-sm text-gray-600">Сократить новую ссылку</p>
            </div>
          </a>
          
          <a href="/dashboard/links" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <span className="text-2xl">🔗</span>
            <div>
              <h4 className="font-medium">Мои ссылки</h4>
              <p className="text-sm text-gray-600">Просмотреть все ссылки</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

