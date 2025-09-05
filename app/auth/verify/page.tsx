"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function VerifyPage() {
  const [status, setStatus] = useState<'pending'|'ok'|'fail'>('pending')
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const email = params.get('email')
    const token = params.get('token')
    if (!email || !token) { setStatus('fail'); return }
    fetch('/api/auth/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, token }) })
      .then(r => r.ok ? setStatus('ok') : setStatus('fail'))
      .catch(() => setStatus('fail'))
  }, [])
  return (
    <div className="mx-auto max-w-md rounded-2xl border bg-white p-6 text-center shadow-sm">
      {status === 'pending' && <p>Подтверждаем…</p>}
      {status === 'ok' && (
        <div>
          <h1 className="mb-2 text-2xl font-bold">Почта подтверждена</h1>
          <Link href="/auth/sign-in" className="underline">Войти</Link>
        </div>
      )}
      {status === 'fail' && (
        <div>
          <h1 className="mb-2 text-2xl font-bold">Ошибка подтверждения</h1>
          <Link href="/auth/sign-in" className="underline">На страницу входа</Link>
        </div>
      )}
    </div>
  )
}



