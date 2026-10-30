import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { authConfig } from './config';
export async function serverAuth() {
  const jar = await cookies();
  const { url, key } = authConfig();
  return createServerClient(url, key, {
    cookies: {
      getAll() { return jar.getAll(); },
      setAll(values) {
        try {
          for (const { name, value, options } of values) {
            jar.set(name, value, { ...options, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
          }
        } catch {
          // Server renders cannot write cookies; middleware refreshes them.
        }
      },
    },
  });
}
