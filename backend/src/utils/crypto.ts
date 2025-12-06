import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts sensitive data (e.g., SSN) using AES-256-GCM
 * @param plain - Plain text to encrypt
 * @returns Encrypted string in format: base64(iv):base64(tag):base64(ciphertext)
 */
export function encryptSensitive(plain: string): string {
  const key = process.env.SSN_ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('SSN_ENCRYPTION_KEY is not set in environment variables');
  }

  // Decode base64 key to buffer
  let keyBuffer: Buffer;
  try {
    keyBuffer = Buffer.from(key, 'base64');
  } catch (error) {
    throw new Error('SSN_ENCRYPTION_KEY must be a valid base64 string');
  }

  if (keyBuffer.length !== 32) {
    throw new Error('SSN_ENCRYPTION_KEY must be exactly 32 bytes (256 bits)');
  }

  // Generate random IV
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  
  // Encrypt
  let ciphertext = cipher.update(plain, 'utf8', 'base64');
  ciphertext += cipher.final('base64');
  
  // Get auth tag
  const authTag = cipher.getAuthTag();
  
  // Return format: iv:tag:ciphertext (all base64)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${ciphertext}`;
}

/**
 * Decrypts sensitive data encrypted with encryptSensitive
 * @param cipher - Encrypted string in format: base64(iv):base64(tag):base64(ciphertext)
 * @returns Decrypted plain text
 */
export function decryptSensitive(cipher: string): string {
  const key = process.env.SSN_ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('SSN_ENCRYPTION_KEY is not set in environment variables');
  }

  // Decode base64 key to buffer
  let keyBuffer: Buffer;
  try {
    keyBuffer = Buffer.from(key, 'base64');
  } catch (error) {
    throw new Error('SSN_ENCRYPTION_KEY must be a valid base64 string');
  }

  if (keyBuffer.length !== 32) {
    throw new Error('SSN_ENCRYPTION_KEY must be exactly 32 bytes (256 bits)');
  }

  // Parse the encrypted string
  const parts = cipher.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const [ivBase64, authTagBase64, ciphertext] = parts;
  
  // Decode components
  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');
  
  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
  decipher.setAuthTag(authTag);
  
  // Decrypt
  let plaintext = decipher.update(ciphertext, 'base64', 'utf8');
  plaintext += decipher.final('utf8');
  
  return plaintext;
}

/**
 * Masks SSN for logging (shows only last 4 digits)
 * @param ssn - Full SSN (can be encrypted or plain)
 * @returns Masked SSN like "****1234"
 */
export function maskSSN(ssn: string): string {
  // If it's encrypted, we can't decrypt just for masking
  // So we assume if it contains colons, it's encrypted
  if (ssn.includes(':')) {
    return '********';
  }
  
  // If it's plain text, show last 4
  if (ssn.length >= 4) {
    return `****${ssn.slice(-4)}`;
  }
  
  return '****';
}

