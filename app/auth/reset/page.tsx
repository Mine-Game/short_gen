"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ResetPage() {
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('token')
    setToken(t || '')
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    const res = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) })
    const data = await res.json().catch(() => ({}))
    setLoading(false)
    if (!res.ok) { setError(data?.error || 'Ошибка'); return }
    setMessage('Пароль обновлен, можно входить')
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-bold">Сброс пароля</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-gray-600">Новый пароль</label>
          <input type="password" className="h-11 w-full rounded-lg border px-3" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        {message && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</div>}
        <button disabled={loading} className="h-11 w-full rounded-lg bg-black font-semibold text-white disabled:opacity-60">
          {loading ? 'Сохраняю…' : 'Сохранить пароль'}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600"><Link href="/auth/sign-in" className="underline">На страницу входа</Link></p>
    </div>
  )
}



