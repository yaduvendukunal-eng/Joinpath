export function apiFailure(error: unknown) {
  let current: unknown = error;
  const messages: string[] = [];
  for (let i = 0; i < 5 && current && typeof current === 'object'; i++) {
    messages.push(String((current as { message?: unknown }).message || ''));
    current = (current as { cause?: unknown }).cause;
  }
  const detail = messages.join(' ');
  let message = 'The server could not load your account data. Check the pnpm dev terminal for details.';
  let code = 'SERVER_ERROR';
  if (/no such table/i.test(detail)) { code = 'DATABASE_NOT_INITIALIZED'; message = 'The local Joinpath database has not been initialized. Follow the database setup command in docs/SUPABASE-SETUP.md, then restart pnpm dev.'; }
  else if (/binding.*DB.*unavailable|D1_ERROR/i.test(detail)) { code = 'DATABASE_UNAVAILABLE'; message = 'Joinpath could not access its D1 database. Check the database binding and the pnpm dev terminal.'; }
  else if (/NEXT_PUBLIC_SUPABASE/i.test(detail)) { code = 'AUTH_CONFIG_MISSING'; message = 'Supabase settings are missing. Copy .env.example to .env.local and restart pnpm dev.'; }
  return Response.json({ error: message, code }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
}
