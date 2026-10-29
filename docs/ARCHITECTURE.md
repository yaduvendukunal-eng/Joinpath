# Implementation reference

## Boundaries

The app uses React client components for screens and interactions, server-rendered route guards for dashboard access, and server API handlers for durable mutations. Tailwind utilities handle layout and responsive styling; `app/globals.css` supplies shared visual primitives.

The primary UI controller is `JoinpathApp.tsx`. The login, candidate table, learning plan, consent editor, joining timeline, and outlook are separate presentational modules. Company and college views reuse reporting components, while the student view composes offer, learning, timeline, and privacy sections.

## Authentication and authorization

`getChatGPTUser()` reads identity supplied by the hosted platform. `app/dashboard/[role]/page.tsx` requires that identity, looks up the saved account, and redirects mismatched role paths to the account's actual dashboard.

API handlers independently check identity and account registration. POST handlers also reject cross-origin requests. Account registration accepts one of the three supported roles; later login requests cannot overwrite an existing role.

Company and college registration does not itself grant access to any student. The student must select that specific workspace as a recipient and allow one or more information categories.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Redirects to `/login` |
| `/login` | Sign-in, first-account setup, sample dashboards |
| `/dashboard/company` | Company dashboard; company account required |
| `/dashboard/student` | Student dashboard; student account required |
| `/dashboard/college` | College dashboard; college account required |
| `/api/account` | Signed-in identity, profile creation, login timestamp |
| `/api/workspace` | Role-appropriate data and protected mutations |

Authentication callback and sign-out routes are owned by the hosting platform.

## Database

### accounts

`id` is the platform's stable per-Site user ID. Core fields include `email`, `name`, `role`, `organization`, `createdAt`, and `lastLogin`.

Student state uses:

- `employerId`, `collegeId`: selected recipient account IDs.
- `consent`: JSON permissions for each recipient role/category.
- `completed`: JSON array of completed module IDs.
- `lastActivity`: timestamp of learning completion.
- `joiningStatus`, `joiningDate`, `dateReason`: latest joining state.
- `jobRole`: target role.
- `history`: JSON joining-date and confirmation history.

### consent_events

Append-only rows include `id`, `userId`, serialized choices and recipients, `createdAt`, and policy `version`. The student UI reads the ten most recent events.

Changing the selected employer clears the prior employer's joining state/history from the active student record. Learning progress is retained.

## API contract

All responses are JSON and marked `Cache-Control: no-store`.

### GET /api/account

Returns `{ user, account }`. For an anonymous request, both values are `null`. For an authenticated identity without registration, only `account` is `null`.

### POST /api/account

First registration:

```json
{
  "role": "student",
  "name": "Aarav Sharma",
  "organization": "RV College"
}
```

Returns `{ "role": "student" }`. Existing accounts retain their stored role and update their last-login timestamp, regardless of a submitted role value.

### GET /api/workspace

Returns `{ me, directory, candidates, audit }`.

- Student: own complete account, registered recipient directory, own recent consent events; candidates is empty.
- Company/college: own account and only linked students with at least one enabled category for that recipient.
- The recipient directory contains workspace ID, organization name, and role; no contact emails.
- Unshared profile fields become placeholders/null. Unshared learning fields become null. Unshared joining fields become null. No completed-module data or learning signal is exposed without learning permission.

### POST /api/workspace

Supported actions:

| Action | Role | Payload | Result |
| --- | --- | --- | --- |
| `consent` | Student | `choices`, `employerId`, `collegeId` | Saves choices and audit event in a batch |
| `complete` | Student | `module`: `01`–`04` | Records unique completion and activity time |
| `confirm` | Student | No additional fields | Requires a company-provided date; records confirmation |
| `offer` | Company | `studentId`, `date`, `reason` | Requires that student's explicit joining consent for this company |

Consent example:

```json
{
  "action": "consent",
  "employerId": "registered-company-account-id",
  "collegeId": null,
  "choices": {
    "company": { "profile": true, "learning": false, "joining": true },
    "college": { "profile": false, "learning": false, "joining": false }
  }
}
```

Use real server-returned recipient IDs, not the illustrative value above. A recipient is required when any associated permission is enabled. All category values must be booleans.

Typical error codes: `400` for invalid input, `401` for missing identity, and `403` for missing registration, wrong role, cross-origin mutation, or missing recipient permission.

## Data flows

**New account:** login → hosted identity → profile setup → account insert → saved-role dashboard.

**Returning account:** hosted identity → existing account lookup → last-login update → saved-role dashboard.

**Consent:** student edits choices → API checks recipients/types → account update plus audit insert → reload own workspace → future recipient responses use new permissions.

**Company date update:** company opens permitted candidate → API verifies linkage and joining permission → saves date/reason/history → student sees updated date and can confirm it.

**Learning:** student opens exercise → marks completion → API saves unique module ID and activity timestamp → permitted recipients receive updated progress.

## Tests

`tests/access.test.cjs` checks:

1. Anonymous workspace reads and writes are rejected.
2. Default consent hides records; field-level projection removes sensitive data.
3. Grants, audit writes, recipient isolation, and withdrawal affect later reads.
4. Student accounts cannot perform company writes; companies require explicit joining access.
5. A later login payload cannot change an account's role.
6. Invalid recipients and cross-origin requests are rejected.

The test harness mocks the identity and Drizzle database layers. Add deployed integration tests and browser tests before a wider production rollout.
