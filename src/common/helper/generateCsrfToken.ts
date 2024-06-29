import { createHmac, randomBytes } from 'crypto';

/**
 * Create CSRF token
 *
 * @param sessionId user session id
 *
 * @returns CSRF token
 */
export default function generateCsrfToken(sessionId: string): string {
  const secret = process.env.CSRF_SECRET;

  const message = sessionId + '!' + randomBytes(64).toString('base64');
  const hmac = createHmac('sha256', secret);
  const hmacGenerated = hmac.update(message).digest('base64');

  const CSRF_TOKEN = hmacGenerated + '.' + message;

  return CSRF_TOKEN;
}
