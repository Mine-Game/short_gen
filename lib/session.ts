import { auth } from './auth'

export async function requireSession() {
  const session = await auth()
  if (!session?.user) throw new Error('UNAUTHORIZED')
  return session
}

export async function requireRole(role: 'admin' | 'user') {
  const session = await requireSession()
  if (!session.user || !session.user.role) throw new Error('UNAUTHORIZED')
  if (role === 'admin' && session.user.role !== 'admin') throw new Error('FORBIDDEN')
  return session
}



