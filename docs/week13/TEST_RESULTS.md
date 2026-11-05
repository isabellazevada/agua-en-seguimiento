# Week 13 — local mechanical pass, November 4, 2026

## Executed
- `npm test`: 23 assertions/tests pass, covering previous closure rules plus acceptance evidence, invalid/future dates, reassignment and continued-leak reopening.
- `npm run test:db`: incremental migrations run successfully in local embedded PostgreSQL (PGlite). Auth schema and two fictional identities are simulated for the test. Owner A can save cases; owner B sees no A cases, history or events and cannot change A's rows. Successful audit events cannot be forged through the authenticated role. History is read-only to the client. Old evidence survives later updates. Incomplete verification and future evidence are rejected. Stale-version updates affect zero rows. Reassignment clears previous acceptance at the database boundary.
- Production compilation: final `npm run build` passed after the reassignment fix.

## Actual defects and fixes
1. Original revision `1eb779e` allowed a continued-leak report with status `reported` through `validateCase`: reproduction returned `errors: []`. The database then rejected the inconsistent row. Added validation requiring `reopened`, with a regression test. This was inconsistent error handling, not a demonstrated database leak.
2. During implementation review, changing the assigned person could retain the previous person's acceptance. Added `changeCaseField` to clear acceptance/source/date on reassignment; the database trigger independently enforces the same behavior. Added regression checks in both layers.

## Not executed / not established
- No production SQL migration, real OAuth login or live two-account Supabase test has been executed.
- Browser interaction/visual QA is pending: the local Playwright browser was absent and its download failed. Successful compilation does not substitute for this check.
- No deployment or redeployment has been completed; GitHub push lacks authentication and Vercel is not connected.
- No synthetic-persona session, five-user research, measured improvement or adoption evidence is claimed.

## Required next checks
Connect GitHub/Vercel, review and apply `supabase/002_week13.sql` to the existing configured project after confirming `001_cases.sql` already exists. Deploy, check cloud save/reload and cross-account isolation, run the interface on desktop/mobile, test the actual deployed version with Laura, document the worst confusion and fix/redeploy. Complete five real-user sessions with at least three strangers. Record actual commit hashes and deployment URLs; do not reconstruct prior evidence.
