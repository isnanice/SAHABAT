/**
 * Enkripsi/dekripsi pesan konseling menggunakan Web Crypto API
 * Memastikan privasi komunikasi antara siswa dan guru BK
 */

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256

async function getKey() {
  const secret = process.env.ENCRYPTION_SECRET
  if (!secret) throw new Error('ENCRYPTION_SECRET tidak dikonfigurasi')

  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret.padEnd(32).slice(0, 32)),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('sahabat-salt-v1'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptMessage(plaintext) {
  const key = await getKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoder = new TextEncoder()

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext)
  )

  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)

  return btoa(String.fromCharCode(...combined))
}

export async function decryptMessage(ciphertext) {
  const key = await getKey()
  const combined = new Uint8Array(
    atob(ciphertext).split('').map((c) => c.charCodeAt(0))
  )

  const iv = combined.slice(0, 12)
  const encrypted = combined.slice(12)

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encrypted
  )

  return new TextDecoder().decode(decrypted)
}
