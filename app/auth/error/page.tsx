"use client"
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Неверный email или пароль'
      case 'EmailNotVerified':
        return 'Email не подтвержден'
      case 'AccessDenied':
        return 'Доступ запрещен'
      default:
        return 'Произошла ошибка при входе'
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-bold text-red-600">Ошибка входа</h1>
      <p className="mb-4 text-gray-600">{getErrorMessage(error)}</p>
      <div className="space-y-2">
        <Link 
          href="/auth/sign-in" 
          className="block w-full rounded-lg bg-black px-4 py-2 text-center font-semibold text-white"
        >
          Попробовать снова
        </Link>
        <Link 
          href="/auth/sign-up" 
          className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-center text-gray-700"
        >
          Зарегистрироваться
        </Link>
      </div>
    </div>
  )
}
