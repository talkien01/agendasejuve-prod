import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'fallback-secret-key-change-it';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function decrypt(input) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function login(user) {
  // Create the session
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ user, expires });

  // Save the session in a cookie
  (await cookies()).set('session', session, { expires, httpOnly: true });
}

export async function logout() {
  // Destroy the session
  (await cookies()).set('session', '', { expires: new Date(0) });
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  return await decrypt(session);
}

/**
 * Helper to check if the current session has one of the allowed roles.
 * @param {Object} session - The session object from getSession()
 * @param {Array<string>} allowedRoles - List of roles permitted (e.g. ['ADMIN', 'PSICOLOGIA'])
 * @returns {boolean}
 */
export function hasRole(session, allowedRoles) {
  if (!session || !session.role) return false;
  return allowedRoles.includes(session.role);
}
