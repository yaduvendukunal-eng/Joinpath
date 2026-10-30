# Supabase email/password edition

This is an independent-hosting edition. The existing ChatGPT-hosted preview retains its managed access gate and has not been replaced by this ZIP.

## What is configured

The supplied project URL and public publishable key are provided in `.env.example`. These values identify the public Supabase Auth client; neither is an administrator secret. Passwords are entered only into the Supabase login flow, are never added to the Joinpath account table, and are never logged by this code.

This edition uses Supabase for identity and cookie-based sessions, and the existing Cloudflare D1 account/workspace database for profile data and saved immutable roles. It does not move application records into Supabase Postgres. College/company membership is still self-reported and requires a separate verification process before real institutional use. Cohort/matching demonstration data remains separate and browser-local at `/prototype`.

## Supabase dashboard setup

1. Open Authentication → Sign In / Providers and confirm Email is enabled. Keep email confirmation enabled.
2. In Authentication → URL Configuration, set the Site URL to your app origin. For local development this is normally `http://localhost:5173`; use the actual URL printed by the terminal.
3. Add these Redirect URLs (replace the origin if your port is different):
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5173/auth/callback?next=/auth/update-password`
4. Add the equivalent two HTTPS URLs for the independent production host, and set the production Site URL when deploying.
5. For a real launch, configure email delivery/SMTP and check your project's send-rate limits. This code does not send mail through ChatGPT and does not automatically change your Supabase settings.

Google sign-in is not included and no Google Cloud account is needed.

## Run locally

Extract the ZIP, open the Joinpath folder containing package.json, then:

```powershell
Copy-Item .env.example .env.local
pnpm install --frozen-lockfile
pnpm build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_silky_madelyne_pryor.sql
pnpm dev
```

Run the database initialization command once for a fresh local database. Open the printed localhost URL. Email confirmation returns to the same browser that started signup (PKCE stores a verifier cookie).

1. Create an account with your own email and password.
2. Confirm the email using Supabase's message.
3. Return to Joinpath and log in.
4. Select student, college, or company, enter profile details, and save the account.
5. On later logins, the server retrieves the saved role and opens its dashboard. Selecting a different URL does not change that role.
6. Use Forgot your password? to request a recovery link. After changing the password, sign out and sign in again.

Supabase manages access/refresh session cookies using its SSR library. Middleware verifies identity and renews sessions. Passwords are not persisted by Joinpath. Cookies necessarily hold authentication credentials; the app still requires HTTPS in production and protection against script injection.

## Independent deployment

Deploy this Vinext/Cloudflare Worker project to a host supporting its current Worker/D1 runtime, outside the ChatGPT Sites sign-in gate. Provision a D1 database, apply the tracked Drizzle migration, and bind it as `DB`. Configure the two public Supabase environment variables for build and runtime. Keep the generated `dist/server/wrangler.json` deployment configuration consistent with your actual database ID, rather than the local placeholder. Never supply a service-role key to browser code.

The supplied publishable key alone cannot configure redirect URLs, email delivery, or other administrator settings. Those steps must be completed in your Supabase dashboard or through a connected management integration.

## Checks and limitations

See the delivery message for executed checks. No real user's account is created automatically. Live signup, email delivery, recovery-link handling, session refresh, and cross-account dashboard behavior must be tested with authorized accounts after the dashboard settings and deployment are configured. The existing hosted ChatGPT preview remains a separate edition.
