> This guide describes the fictional prototype. For the current login and environment setup, use SUPABASE-SETUP.md.

# Student-first Joinpath

The default role is Student. My home brings together the latest recorded joining date, separate student confirmation, learning progress, and a company/college sharing summary. The next-step button opens the relevant existing workflow.

Students can check and uncheck all six cards directly. Checklist ticks do not grant consent or confirm joining. Sharing remains off by default and is enforced by the existing API. The recruiter contact action opens an editable message draft; it does not send messages. Company and college dashboards remain available.

## Run locally

Use Node.js 22.13+ and pnpm. Open a terminal in the extracted project folder (the one containing package.json).

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Follow README.md for database initialization on a fresh installation. Explore the student dashboard uses sample data without an account. Real account access retains the existing identity setup; this update does not add email/password login.

## Scope and verification

One connected company is supported at a time. Offer validity is not independently verified. No automatic recruiter messages or real-time polling are added. TypeScript checks, eight existing API tests, and production build passed. Browser QA was unavailable because the preview environment could not resolve its Vinext dependency.
