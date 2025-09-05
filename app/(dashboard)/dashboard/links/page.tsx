"use client"
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface Link {
  id: string
  originalUrl: string
  shortId: string
  shortUrl: string
  clicks: number
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  createdAt: string
  updatedAt: string
}

export default function LinksPage() {
  const { data: session } = useSession()
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLinks() {
      try {
        const res = await fetch('/api/dashboard/links')
        if (res.ok) {
          const data = await res.json()
          setLinks(data)
        } else {
          setError('Не удалось загрузить ссылки')
        }
      } catch (e) {
        setError('Ошибка при загрузке ссылок')
        console.error('Failed to fetch links:', e)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchLinks()
    }
  }, [session])

  async function copyToClipboard(text: string, linkId: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(linkId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (e) {
      console.error('Failed to copy:', e)
    }
  }

  async function deleteLink(linkId: string) {
    if (!confirm('Вы уверены, что хотите удалить эту ссылку?')) {
      return
    }

    setDeletingId(linkId)
    try {
      const res = await fetch(`/api/dashboard/links/${linkId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        // Удаляем ссылку из списка
        setLinks(links.filter(link => link.id !== linkId))
      } else {
        setError('Не удалось удалить ссылку')
      }
    } catch (e) {
      setError('Ошибка при удалении ссылки')
      console.error('Failed to delete link:', e)
    } finally {
      setDeletingId(null)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Все мои ссылки</h1>
          <p className="text-gray-600">Управляйте вашими сокращенными ссылками</p>
        </div>
        
        <div className="rounded-xl border bg-white p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Все мои ссылки</h1>
          <p className="text-gray-600">Управляйте вашими сокращенными ссылками</p>
        </div>
        <a 
          href="/dashboard/create" 
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
        >
          Создать новую
        </a>
      </div>
      
      {error && (
        <div className="rounded-xl border bg-red-50 p-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {links.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">У вас пока нет ссылок</h3>
          <p className="text-gray-600 mb-6">Создайте первую короткую ссылку и она появится здесь</p>
          <a 
            href="/dashboard/create" 
            className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
          >
            Создать ссылку
          </a>
        </div>
      ) : (
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900">Всего ссылок: {links.length}</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {links.map((link) => (
              <div key={link.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900 truncate">
                        {link.originalUrl}
                      </h4>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {link.clicks} переходов
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span>Короткая:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                          {link.shortUrl}
                        </code>
                        <button
                          onClick={() => copyToClipboard(link.shortUrl, link.id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Копировать"
                        >
                          {copiedId === link.id ? '✅' : '📋'}
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span>ID:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                          {link.shortId}
                        </code>
                      </div>
                    </div>
                    
                    {/* UTM метки */}
                    {(link.utmSource || link.utmMedium || link.utmCampaign || link.utmTerm || link.utmContent) && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs font-medium text-gray-700 mb-2">UTM метки:</div>
                        <div className="flex flex-wrap gap-2">
                          {link.utmSource && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              source: {link.utmSource}
                            </span>
                          )}
                          {link.utmMedium && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              medium: {link.utmMedium}
                            </span>
                          )}
                          {link.utmCampaign && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                              campaign: {link.utmCampaign}
                            </span>
                          )}
                          {link.utmTerm && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              term: {link.utmTerm}
                            </span>
                          )}
                          {link.utmContent && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-pink-100 text-pink-800">
                              content: {link.utmContent}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-gray-500">
                      Создано: {formatDate(link.createdAt)}
                      {link.updatedAt !== link.createdAt && (
                        <span className="ml-4">
                          Обновлено: {formatDate(link.updatedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <a
                      href={link.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                    >
                      Открыть
                    </a>
                    <a
                      href={link.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                    >
                      Оригинал
                    </a>
                    <button
                      onClick={() => deleteLink(link.id)}
                      disabled={deletingId === link.id}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-200 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Удалить ссылку"
                    >
                      {deletingId === link.id ? 'Удаляю...' : '🗑️'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
