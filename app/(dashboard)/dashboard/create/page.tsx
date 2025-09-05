"use client"
import { useState } from 'react'
import UTMFields from '../../../../components/UTMFields'

interface UTMData {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

export default function CreateLinkPage() {
  const [url, setUrl] = useState('')
  const [utmData, setUtmData] = useState<UTMData>({})
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    short: string
    target: string
    shortId: string
    clicks: number
    createdAt: string
  } | null>(null)
  const [error, setError] = useState('')

  async function handleShorten() {
    if (!url) return
    setLoading(true)
    setCopied(false)
    setError('')
    setResult(null)
    
    try {
      // Фильтруем пустые UTM параметры
      const filteredUtmData = Object.fromEntries(
        Object.entries(utmData).filter(([_, value]) => value && value.trim() !== '')
      )
      
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url,
          utmParams: Object.keys(filteredUtmData).length > 0 ? filteredUtmData : undefined
        })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Ошибка создания ссылки')
      
      setResult(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard() {
    if (!result?.short) return
    try {
      await navigator.clipboard.writeText(result.short)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Failed to copy:', e)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Создать ссылку</h1>
        <p className="text-gray-600">Сократите вашу длинную ссылку</p>
      </div>
      
      <div className="rounded-xl border bg-white p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Введите длинную ссылку
            </label>
            <input
              id="url"
              type="url"
              placeholder="https://example.com/very/long/url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full h-12 rounded-lg border px-4 shadow-sm outline-none ring-0 transition focus:border-black/70 focus:ring-2 focus:ring-black/10"
            />
          </div>

          {/* UTM параметры */}
          <div className="border-t border-gray-200 pt-6">
            <UTMFields values={utmData} onChange={setUtmData} />
          </div>
          
          <button
            onClick={handleShorten}
            disabled={loading || !url}
            className="w-full h-12 rounded-lg bg-black px-6 font-semibold text-white transition hover:bg-black/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Создаю...' : 'Создать короткую ссылку'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 p-6 rounded-lg bg-green-50 border border-green-200">
            <h3 className="font-semibold text-green-800 mb-4">Ссылка создана успешно!</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-green-600 mb-1">Короткая ссылка</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={result.short}
                    readOnly
                    className="flex-1 h-10 rounded-lg border bg-white px-3 text-sm font-mono"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="h-10 px-4 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    {copied ? 'Скопировано!' : 'Копировать'}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-green-600 mb-1">Оригинальная ссылка</label>
                <p className="text-sm text-green-800 break-all">{result.target}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-green-200">
                <div>
                  <span className="text-xs text-green-600">ID:</span>
                  <p className="text-sm font-mono text-green-800">{result.shortId}</p>
                </div>
                <div>
                  <span className="text-xs text-green-600">Переходы:</span>
                  <p className="text-sm text-green-800">{result.clicks}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
