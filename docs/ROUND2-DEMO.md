> This guide describes the fictional prototype. For the current login and environment setup, use SUPABASE-SETUP.md.

# Joinpath — Round 2 connected prototype

## Start

Extract the ZIP. In PowerShell, open the extracted `Joinpath` directory containing `package.json`:

```powershell
cd "C:\DEV\Joinpath"
pnpm install --frozen-lockfile
pnpm dev
```

Open the localhost URL printed by the terminal. `/` redirects to `/prototype`.
The new prototype does not need database initialization or a login. It uses fictional, browser-local records. Select a persona in the top bar to demonstrate another stakeholder. Use the same browser tab to carry changes across personas. Do not enter real student information.

The earlier account-backed app remains accessible at `/login`. Its database setup remains in README.md. The new prototype's features are not integrated with those account-backed APIs.

## Six-minute demonstration

1. Choose **RV Placement Cell**. Open **Student skills**. Aarav has JavaScript and Git assessments. Add `SQL`, level `1`, today's assessment date, and `Faculty-reviewed introductory SQL lab` as evidence.
2. Choose **Acme Technologies**. Open **Vacancies & matches**. The Graduate Software Engineer role requires JavaScript:2, Git:2, SQL:1. Aarav now meets 3/3 requirements (100%). Expand the evidence. Explain that this is requirement coverage, not a hiring prediction. Existing sample offers are already issued, so use a new vacancy for the next step.
3. Create a vacancy called `Graduate Web Developer`, with `JavaScript:2, Git:2`. Shortlist Aarav, then issue an offer with a future joining date. Open **Offers & joining** and build its role learning plan. Plans derive tasks from required skills.
4. Choose **Aarav Sharma**. Open **My offers**: offers from different companies coexist. Confirm the new offer. In **Learning**, tick and untick a card: verification does not change. Submit an HTTPS evidence link to a test document/repository you control.
5. Choose **Acme Technologies**. Review the submitted evidence. Choose **Needs revision**, with feedback; switch to Aarav to resubmit, then review as **Verified**. These are manual reviews, not automatic code execution.
6. In Acme's offers, change the new joining date and supply a reason. The student's previous confirmation resets. The history retains the reason. The pre-seeded Aarav offer demonstrates two confirmation requests older than 48 hours; fresh requests are rate-limited to one per 24 hours.
7. Choose **RV Placement Cell**, open **Joining tracker**, and open a clarification case for the deferred offer. Acme can reply from **Support**. The college or student can mark it resolved. No external messages are sent.
8. Choose **Acme Technologies** and find Ananya's sample offer. It has a past joining date and an accepted intention. Verify joining with today's date and a fictional attendance reference. Choose the college and view **Reports**: the actual joining count increases separately from the offer count. Export the visible outcomes to CSV.
9. Choose **Aarav**, open **Consent**, and turn off college-assessed skills for Acme. Switch to Acme: Aarav is excluded from its matching screen. Nova's permissions are independent. Withdrawing joining access also hides related joining/support records. No penalty or risk flag is generated for refusing consent.

## Responsibilities

- Student: owns sharing choices, responds independently to offers, checks personal tasks, submits evidence, raises support cases.
- College: records assessed skill levels with evidence/date, coordinates clarification, observes permitted learning progress, reports employer-verified outcomes.
- Company: defines vacancies and minimum skills, inspects matching reasons, manually shortlists/selects, issues offers, revises dates, reviews learning evidence, verifies attendance.

## Data and algorithms

`lib/prototype/model.ts` contains typed domain records, command validation, matching, signals, and seed data. `components/prototype/PrototypeApp.tsx` implements the React/Tailwind UI. `app/prototype/page.tsx` exposes the route.

Records: students, recipient-specific permissions, skill assessments, vacancies, offer-specific histories and confirmation requests, learning tasks/submissions, clarification cases, and action history.

Match percentage = number of required skills meeting the minimum level / number of required skills × 100. Matching normalizes case and surrounding whitespace; it does not infer synonyms. All required skills have equal weight. Unrecorded skills are gaps, not proof that a candidate lacks the ability. Evidence age is shown for human review but is not automatically expired.

Signals: at least 21 days since last learning activity; at least two unanswered in-app confirmation requests each at least 48 hours old; employer-deferred joining. Signals use only categories shared with the active persona. They do not automatically reject or score candidates.

A personal checkbox cannot verify learning. Submission links require HTTPS. The assigned company reviews submitted evidence with mandatory feedback. Resubmission resets review status. The college coordinates support but cannot mark work verified.

## Honest prototype limits

- New workflows are browser-local, persisted in localStorage, and use five fixed fictional personas. Role switching is a demonstration control, not authentication. Client-side filtering and command checks are not a security boundary. Do not describe these new flows as server-secured or database-backed.
- The existing `/login` app separately uses its original identity/D1/Drizzle implementation and is unchanged by prototype actions. Email/password login is not added.
- Demo permissions begin enabled so the scenario is immediately usable; this is explicitly labelled. A production enrollment flow must collect explicit consent and default new recipients to no access.
- No automated email, code execution, verified institutional membership, evidence plagiarism detection, real-time multi-user synchronization, or independent offer-validity check is implemented.
- College assessments are recorded assertions with evidence, not independently certified skills. The employer makes the final selection and verifies actual joining.
- Withdrawal hides subsequent persona views but cannot recall prior exports or remove data from someone who has local browser storage access.
- Production work remaining: real authentication and verified organization memberships; normalized server-side tables; server-enforced row/field authorization; durable audit records; safe evidence storage; notification delivery; conflict handling; and a multi-account browser pilot.

## Validation

```powershell
pnpm typecheck
pnpm test
pnpm build
```

All 17 automated tests passed: eight existing API tests and nine new domain workflow tests. TypeScript and the production build passed. Tests cover assessment-to-match changes, consent withdrawal, separate offers, employer isolation, date changes, request cooldown, explainable signals, checklist/review separation, resubmission, college cases, joining verification, and invalid inputs.

Browser QA was attempted. The managed preview server started but its browser URL returned connection refused. Visual layout and click-through flows remain unverified in a real browser; run the demonstration above locally before presenting.
