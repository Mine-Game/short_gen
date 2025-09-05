"use client"
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    await fetch('/api/auth/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    setLoading(false)
    setMessage('Если аккаунт существует, письмо отправлено.')
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-bold">Восстановление пароля</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-gray-600">Email</label>
          <input className="h-11 w-full rounded-lg border px-3" value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <button disabled={loading} className="h-11 w-full rounded-lg bg-black font-semibold text-white disabled:opacity-60">
          {loading ? 'Отправляю…' : 'Отправить письмо'}
        </button>
        {message && <div className="rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-700">{message}</div>}
      </form>
      <p className="mt-4 text-sm text-gray-600"><Link href="/auth/sign-in" className="underline">Назад ко входу</Link></p>
    </div>
  )
}



