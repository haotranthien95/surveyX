// src/lib/auth.ts
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { jwtVerify } from 'jose';

export type UserRole = 'admin' | 'manager';

export interface SessionData {
  token?: string; // signed JWT — set on login, cleared on logout
}

export const sessionOptions = {
  cookieName: 'admin_session',
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours (86400 seconds)
  },
};

export async function getUserRole(): Promise<UserRole> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.token) return 'admin'; // fallback (proxy already guards)

  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
    const { payload } = await jwtVerify(session.token, secret);
    return (payload.role as UserRole) ?? 'admin';
  } catch {
    return 'admin';
  }
}

export async function isAdmin(): Promise<boolean> {
  return (await getUserRole()) === 'admin';
}
