import { getServerSession } from 'next-auth'
import { authConfig } from './auth'

export async function requireSession() {
  const session = await getServerSession(authConfig)
  if (!session?.user) throw new Error('UNAUTHORIZED')
  return session
}

export async function requireRole(role: 'admin' | 'user') {
  const session = await requireSession()
  if (!session.user || !session.user.role) throw new Error('UNAUTHORIZED')
  if (role === 'admin' && session.user.role !== 'admin') throw new Error('FORBIDDEN')
  return session
}



