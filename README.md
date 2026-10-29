# Joinpath

An offer-to-joining workspace for students, companies, and colleges. This source handoff uses **React 19, TypeScript, Tailwind CSS 4, Vinext, Cloudflare Workers, Drizzle ORM, and D1**.

The screens were extracted into focused components from the deployed implementation. This is a source-code export; it does not change the hosted app.

## Start here

- `components/joinpath/JoinpathApp.tsx`: application state, navigation, and role-specific dashboard composition.
- `components/joinpath/LoginScreen.tsx`: login, account registration, and sample-mode entry.
- `components/joinpath/ConsentSettings.tsx`: recipient selection, granular sharing, withdrawal, and history.
- `app/api/account/route.ts`: identity lookup and account registration.
- `app/api/workspace/route.ts`: authorized reads and writes, consent enforcement, learning, joining updates.
- `docs/ARCHITECTURE.md`: routes, data model, API contracts, and behavior.

## Project structure

```text
app/
  page.tsx                       Root redirect to login
  layout.tsx                     Shared metadata and stylesheet
  globals.css                    Tailwind and visual theme
  chatgpt-auth.ts                 Server-only hosted identity helpers
  login/page.tsx                 Login route
  dashboard/[role]/page.tsx       Server-protected role route
  api/account/route.ts           Account API
  api/workspace/route.ts         Workspace API
components/joinpath/
  JoinpathApp.tsx                State and dashboard composition
  LoginScreen.tsx                Login / registration
  CandidateTable.tsx            Search/filter results and actions
  ConsentSettings.tsx           Sharing choices and audit history
  LearningPlan.tsx               Role learning modules
  JoiningTimeline.tsx           Student joining history
  JoiningOutlook.tsx             Company/college joining overview
  common.tsx                    Brand, status badge, statistic card
lib/joinpath/
  api.ts                        Typed fetch wrapper entry point
  data.ts                       Role constants, modules, sample records
lib/                            Platform runtime support
worker/index.ts                 Worker request entry point
scripts/                        Framework and platform build helpers
db/
  schema.ts                     Accounts and consent audit schema
  index.ts                      D1/Drizzle client
drizzle/                        SQL migration and generation metadata
tests/access.test.cjs           Authorization and consent tests
docs/ARCHITECTURE.md            Implementation reference
.openai/hosting.json            DB binding; no deployed project identity
vite.config.ts                  React server, Worker, and Sites integration
postcss.config.mjs              Tailwind compiler configuration
package.json                   Development and verification commands
pnpm-lock.yaml                 Dependency lockfile
```

## Local setup

Requirements: Node.js **22.13+**, pnpm **11.25.0**, and package-registry access on the machine where dependencies are installed.

```bash
pnpm install --frozen-lockfile
pnpm build
```

The build generates the local Worker configuration. On a **fresh local database**, apply the included schema once:

```bash
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_silky_madelyne_pryor.sql
```

Then run:

```bash
pnpm dev
```

Open the localhost URL printed by the development server, normally `http://localhost:5173/login`.

Do not run the initial migration again against an already initialized database. Future schema changes should generate additional migrations with `pnpm db:generate`.

### Login behavior

Production authentication is provided by **ChatGPT Sites**. Joinpath does not implement an email/password identity provider or store passwords.

1. Choose a role on the login screen.
2. Continue with ChatGPT.
3. On first use, enter your profile and organization information.
4. The server stores your role and redirects to `/dashboard/company`, `/dashboard/student`, or `/dashboard/college`.
5. Returning users are routed using their saved role. Editing the URL does not change the account role.

Portable localhost development includes a **development-only mock sign-in**. The built-in identity is `local_seedy` / `seedy@sites.test`. It is a single development account, not a multi-user authentication service. Use **Explore dashboard** to inspect all three sample roles without creating separate accounts. Mock sign-in is disabled in production builds.

### Student consent

A student selects a specific registered company and/or college and independently enables:

- Profile/contact details.
- Learning progress and last activity.
- Joining status and dates.

All options start off. Choices and changes are persisted. Server-side projection removes fields without permission; withdrawal prevents subsequent reads through the app. Previously downloaded exports cannot be recalled.

Real accounts start with empty records. Fictional candidate records appear only in sample mode. Sample changes remain in memory and do not change database records.

## Verification

```bash
pnpm typecheck
pnpm test
pnpm build
```

The handoff passes TypeScript checking, six server access/consent tests, and a production build. The tests exercise route handlers using a mocked database; they are not browser or deployed-D1 integration tests. Browser end-to-end verification was not available in the authoring environment.

## Hosting and portability

The runtime expects Cloudflare D1 and Sites-authenticated identity headers. The supplied manifest declares `DB` but intentionally omits the existing deployed Site ID. Register a new Site for a separate deployment; do not copy the original project's identity.

Deploying this code on another provider requires replacing the hosted identity adapter and supplying a compatible database/runtime integration. Do not expose an endpoint on another host that blindly trusts client-supplied identity headers.

The existing hosted Site remains owner-private. Source export does not change its sharing settings or grant other users access.

## Scope and extension points

- Organization registration is self-reported, not domain-verified membership.
- Each authenticated identity has one saved role.
- The learning plan is a curated four-module Software Engineer plan; role selection and generated curricula can be added in `lib/joinpath/data.ts`.
- Companies can provide/revise a joining date only for linked students who authorize joining access.
- Learning inactivity flags are derived from shared activity; automated reminders, mail delivery, two-confirmation tracking, and a real employer “mark joined” action are not implemented in the live workflow. Related sample data illustrates the intended experience.
- No account deletion, identity-provider password recovery, team invitations, or organization verification workflow is included.

No credentials, database contents, dependencies, or generated builds are included in this archive.
