// Simple in-memory store for short links
// Persist across dev hot-reloads by attaching to globalThis
// NOTE: This still resets on full server restarts. Use a DB for persistence.

declare global {
  // eslint-disable-next-line no-var
  var __short_links_store__: Map<string, string> | undefined
}

const idToUrl: Map<string, string> =
  globalThis.__short_links_store__ || (globalThis.__short_links_store__ = new Map())

export function saveUrl(id: string, url: string): void {
  idToUrl.set(id, url)
}

export function getUrl(id: string): string | undefined {
  return idToUrl.get(id)
}

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function generateId(length = 7): string {
  let out = ''
  // Use crypto for better randomness if available
  const array = new Uint32Array(length)
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(array)
    for (let i = 0; i < length; i++) {
      out += alphabet[array[i] % alphabet.length]
    }
    return out
  }
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}


