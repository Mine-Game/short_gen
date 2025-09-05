"use client"
import Link from 'next/link'
import { useState } from 'react'

export default function HomePage() {
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleShorten() {
    if (!url) return
    setLoading(true)
    setCopied(false)
    try {
      const res = await fetch('/api/public/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Ошибка')
      await navigator.clipboard.writeText(data.short)
      setCopied(true)
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex flex-col gap-24">
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-b from-pink-100 via-pink-50 to-amber-50">
        <div className="absolute inset-x-0 -top-20 h-40 bg-pink-200/50 blur-3xl" />
        <div className="relative grid gap-8 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full border bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur">Быстро и просто</span>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Сокращай ссылки в один клик
            </h1>
            <p className="max-w-xl text-base text-gray-600 md:text-lg">
              Вставьте длинный URL — получите короткую ссылку, готовую к отправке. Без регистрации и лишних шагов.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="url"
                placeholder="Вставьте ссылку сюда"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 w-full rounded-lg border px-4 shadow-sm outline-none ring-0 transition focus:border-black/70 focus:ring-2 focus:ring-black/10"
              />
              <button
                onClick={handleShorten}
                disabled={loading}
                className="h-12 shrink-0 rounded-lg bg-black px-6 font-semibold text-white transition hover:bg-black/90 disabled:opacity-60"
              >
                {loading ? 'Сокращаю…' : 'Сократить'}
              </button>
            </div>
            {copied && (
              <div className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-gray-700 shadow-sm">
                Скопировано в буфер обмена
              </div>
            )}
          </div>

          <div className="relative hidden md:block">
            <div className="absolute -inset-6 rounded-3xl bg-amber-200/50 blur-2xl" />
            <div className="relative rounded-2xl border bg-white p-6 shadow-xl">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="rounded-lg border bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">URL</div>
                  <div>https://example.com/very/long/url/with/query?param=true&another=param</div>
                </div>
                <div className="rounded-lg border bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">Short</div>
                  <div>https://sho.rt/abc123</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: 'Мгновенно',
            desc: 'Сокращение занимает секунды — экономьте время себе и получателям.'
          },
          {
            title: 'Аккуратно',
            desc: 'Чистый, понятный интерфейс без лишнего. Ничего лишнего — только ссылка.'
          },
          {
            title: 'Надёжно',
            desc: 'Современный стек и лучшие практики. Готово к росту и интеграциям.'
          }
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
            <p className="text-sm text-gray-600">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border bg-white p-6 md:p-10">
        <h2 className="mb-6 text-2xl font-bold">Как это работает</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            { step: '1', title: 'Вставьте ссылку', text: 'Скопируйте длинный URL и вставьте в поле ввода сверху.' },
            { step: '2', title: 'Нажмите «Сократить»', text: 'Мы сгенерируем короткую ссылку и покажем результат.' },
            { step: '3', title: 'Поделитесь', text: 'Распространяйте короткий URL где угодно — быстро и удобно.' }
          ].map((s) => (
            <li key={s.step} className="rounded-xl border bg-gray-50 p-5">
              <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">{s.step}</div>
              <h4 className="mb-1 font-semibold">{s.title}</h4>
              <p className="text-sm text-gray-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="flex flex-col items-center justify-between gap-4 rounded-2xl border bg-white px-6 py-6 md:flex-row">
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} ShortGen</p>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="hover:underline">Кабинет</Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
        </div>
      </footer>
    </div>
  )
}

