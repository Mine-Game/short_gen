import crypto from 'crypto'
import { prisma } from './prisma'

function sha256(s: string) {
  return crypto.createHash('sha256').update(s).digest('hex')
}

export async function issueEmailVerification(email: string, minutes = 60) {
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = sha256(token)
  const expires = new Date(Date.now() + minutes * 60_000)
  await prisma.verificationToken.create({ data: { identifier: email, tokenHash, expires } })
  return token
}

export async function consumeEmailVerification(email: string, token: string) {
  const tokenHash = sha256(token)
  const row = await prisma.verificationToken.findUnique({
    where: { identifier_tokenHash: { identifier: email, tokenHash } },
  })
  if (!row || row.expires < new Date()) return false
  await prisma.verificationToken.delete({ where: { identifier_tokenHash: { identifier: email, tokenHash } } })
  return true
}

export async function issuePasswordReset(userId: string, minutes = 30) {
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = sha256(token)
  const expires = new Date(Date.now() + minutes * 60_000)
  await prisma.passwordResetToken.create({ data: { userId, tokenHash, expires } })
  return token
}

export async function consumePasswordReset(token: string) {
  const tokenHash = sha256(token)
  const row = await prisma.passwordResetToken.findFirst({ where: { tokenHash } })
  if (!row || row.expires < new Date()) return null
  await prisma.passwordResetToken.delete({ where: { id: row.id } })
  return row.userId
}

export function hashIp(ip: string) {
  return sha256(ip)
}

export async function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}



