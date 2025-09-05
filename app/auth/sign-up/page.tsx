"use client"
import Link from 'next/link'
import { useState } from 'react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    const res = await fetch('/api/auth/sign-up', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    const data = await res.json().catch(() => ({}))
    setLoading(false)
    if (!res.ok) { setError(data?.error || 'Ошибка регистрации'); return }
    setMessage('Регистрация успешна! Теперь вы можете войти в систему.')
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-bold">Регистрация</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-gray-600">Email</label>
          <input className="h-11 w-full rounded-lg border px-3" value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600">Пароль</label>
          <input type="password" className="h-11 w-full rounded-lg border px-3" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        {message && <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{message}</div>}
        <button disabled={loading} className="h-11 w-full rounded-lg bg-black font-semibold text-white disabled:opacity-60">
          {loading ? 'Регистрирую…' : 'Зарегистрироваться'}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">Уже есть аккаунт? <Link href="/auth/sign-in" className="underline">Войти</Link></p>
    </div>
  )
}



