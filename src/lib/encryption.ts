import crypto from "node:crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12 // 96-bit IV recommended for GCM

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)")
  }
  return Buffer.from(hex, "hex")
}

/**
 * Encrypts a plaintext string with AES-256-GCM.
 * Returns a base64-encoded string in the format "iv:authTag:ciphertext".
 */
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv) as crypto.CipherGCM

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":")
}

/**
 * Decrypts a string produced by encrypt().
 */
export function decrypt(encoded: string): string {
  const key = getKey()
  const [ivB64, authTagB64, encryptedB64] = encoded.split(":")

  const iv = Buffer.from(ivB64, "base64")
  const authTag = Buffer.from(authTagB64, "base64")
  const encrypted = Buffer.from(encryptedB64, "base64")

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv) as crypto.DecipherGCM
  decipher.setAuthTag(authTag)

  return decipher.update(encrypted).toString("utf8") + decipher.final("utf8")
}
