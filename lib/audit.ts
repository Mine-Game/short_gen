import { prisma } from './prisma'

export async function logAudit(action: string, meta?: any, actorId?: string | null) {
  try {
    await prisma.auditLog.create({ data: { action, actorId: actorId || null, meta } })
  } catch (error) {
    console.log('Audit logging failed:', error)
    // В режиме разработки продолжаем без логирования аудита
  }
}



