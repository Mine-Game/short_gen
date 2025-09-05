import { hash as aHash, verify as aVerify } from 'argon2'

export async function hashPassword(plain: string) {
  return aHash(plain, { type: 2 })
}

export async function verifyPassword(hash: string, plain: string) {
  return aVerify(hash, plain)
}



