"use client"
import Link from 'next/link'
import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await signIn('credentials', {
      email,
      password,
      callbackUrl: '/dashboard',
      redirect: true,
    })
    setLoading(false)
    if (res && 'error' in res && res.error) {
      setError('Неверные данные или аккаунт не подтвержден')
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-bold">Вход</h1>
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
        <button disabled={loading} className="h-11 w-full rounded-lg bg-black font-semibold text-white disabled:opacity-60">
          {loading ? 'Входим…' : 'Войти'}
        </button>
      </form>
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <Link href="/auth/forgot" className="underline">Забыли пароль?</Link>
        <Link href="/auth/sign-up" className="underline">Регистрация</Link>
      </div>
    </div>
  )
}



