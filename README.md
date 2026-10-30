# Joinpath

A campus offer-to-joining prototype shared by students, colleges and employers. This repository contains the **Supabase email/password edition**, including a **Judge Preview** for exploring all three dashboards without creating a Joinpath account.

## Run the prototype

Requirements: Node.js 22.13 or newer, pnpm 11.25, and internet access to install dependencies. Open a terminal in this folder (the one containing `package.json`).

Run each command separately in Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
pnpm install --frozen-lockfile
pnpm build
```

For a **fresh local database**, initialize the schema once:

```powershell
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_silky_madelyne_pryor.sql
```

Start the app:

```powershell
pnpm dev
```

Open the localhost URL printed in the terminal (normally `http://localhost:5173/login`). On macOS/Linux, use `cp .env.example .env.local` instead of `Copy-Item`.

Do not reapply the initial migration to an existing initialized database. For authentication setup and troubleshooting, see [Supabase setup](docs/SUPABASE-SETUP.md).

## Judge walkthrough

On the login page, choose **Student**, **College**, or **Company** under **Judge Preview**. Use **Explore as** to switch personas. You can also open `/prototype` directly.

1. **College:** record a student's assessed skills, proficiency and dated evidence.
2. **Company:** create a vacancy, inspect requirement coverage, shortlist a candidate and issue an offer.
3. **Student:** respond to the offer, review sharing choices, follow the learning plan and submit an evidence link.
4. **Company:** review the submission as Verified or Needs revision. Changing the joining date records a reason and requires a fresh student response.
5. **College:** raise and follow an unresolved joining support case.
6. **Company:** use the seeded past-date accepted offer to demonstrate evidence-backed actual joining. Future attendance cannot be verified.
7. **Company/College:** inspect cohort flags with their reasons, including 21-day learning inactivity and two sufficiently aged unanswered confirmation requests.

Demo data is **fictional and browser-local**. Role switching is a demonstration feature, not authentication. It does not grant access to real accounts. A task checkbox reports completion; employer evidence review is separate. Consent withdrawal is not a risk signal.

## Real accounts and storage

Supabase Auth verifies identity and handles password/session flows. Configure email confirmation and redirect URLs using [the setup guide](docs/SUPABASE-SETUP.md). No Google Cloud account is required for email/password login.

Vinext server routes verify the user. Cloudflare D1 and Drizzle store account roles, consent and the existing authenticated workspace. A saved role routes the user to `/dashboard/student`, `/dashboard/college` or `/dashboard/company`. Role metadata from the client cannot change an existing role.

**Advanced skills, vacancy, multi-offer, evidence-review and cohort workflows remain in the separate browser-local prototype. They are not yet integrated with the authenticated database.** Company and college affiliation is self-reported, not institutionally verified. This edition does not move application data into Supabase Postgres.

The ChatGPT-hosted preview is a separate private deployment. A judge-preview link does not bypass its hosting access gate. This repository can run locally.

## Code map

| Folder | Responsibility |
| --- | --- |
| `app/` | Pages, auth callback/recovery and protected account/workspace APIs |
| `components/joinpath/` | Login, judge entry, authenticated dashboards and consent controls |
| `components/prototype/` | Interactive three-role demonstration and cohort UI |
| `lib/supabase/` | Browser/server auth clients and configuration |
| `lib/prototype/` | Skill matching, offer workflows and explainable cohort rules |
| `lib/joinpath/` | Typed API client and safe response/error handling |
| `db/`, `drizzle/` | D1/Drizzle schema and migration |
| `tests/` | Access, consent, auth, response and prototype rule tests |
| `scripts/`, `worker/` | Framework and Cloudflare runtime helpers |
| `docs/` | Setup and implementation references |

Some earlier architecture documents describe the original hosted edition. This README and `docs/SUPABASE-SETUP.md` describe the current authentication and storage boundaries.

## Verification

```powershell
pnpm test
pnpm typecheck
pnpm build
```

The suite contains 31 automated tests using mocked APIs and fictional domain data. These do not replace live multi-user, email delivery, recovery and deployed database tests.

## Submission and limitations

Provide this repository or a downloaded source ZIP, plus a short backup demo recording. Test the exact source bundle on the intended device/network. A recording is not included here.

Production work remains: integrate advanced records into the backend, verify institutions, add dependable notifications and validate real multi-user operation. No measured reduction in student non-joining is claimed.

Stack: React, TypeScript, Tailwind CSS, Vinext, Supabase JS/SSR, Drizzle, Cloudflare Workers/D1. See `package.json` and `pnpm-lock.yaml` for complete dependency disclosure. Matching and flagging use deterministic rules, not a trained AI model. ChatGPT assisted code development, debugging and documentation. Demo records are fictional.

Never commit `.env.local`, database contents, passwords, secret/service-role keys, generated builds or `node_modules`. `.env.example` contains only public client configuration.
