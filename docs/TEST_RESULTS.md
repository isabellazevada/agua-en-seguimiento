# Local verification record

## Executed

15 automated domain-rule tests passed using Node's built-in runner:
- Required fields and whitespace handling.
- Valid pending record and explicit complete closure.
- No implicit verified closure on ordinary save.
- Missing, failed, inconclusive or unreachable verification.
- Continued loss triggers reopening and requires a reason.
- Invalid, future and out-of-order evidence dates.
- Text type/length limits and invalid statuses.

See tests/rules.test.mjs. These tests exercise application rules,
not a live Supabase database or field repair outcomes.

Production compilation also passed with `npm run build` (Next.js 16.4.3).
Local HTTP/browser smoke testing was not completed in this environment.

## Still required

- Live Google sign-in, persistent save/reload and account isolation.
- SQL constraints and RLS against real Supabase test accounts.
- Browser usability, keyboard and mobile walkthrough.
- Actual deployed mechanical test/fix/redeploy evidence.
- Fresh-chat synthetic persona test and documented retest.
- Real coordinator baseline comparison; no measured 10:1 claim.

No deployment, user interview, physical repair or persona result
has been invented. Record actual results as they occur.

## Week 14 local mechanical pass

- Production build and the 20 automated tests passed.
- The calculator and cases routes returned HTTP 200. The pricing API returned HTTP 401 for anonymous reads and writes.
- A DOM test rendered the Site fixture ($50 before the fee, -$440 after, 0.10×), saved it in demo mode, reopened it and rejected an event without a date.
- An isolated PostgreSQL test applied the migration. The owner could read the scenario and its events. Another identity could read neither and could not attach a decision event. Anonymous access was denied.
- Inspection found the calculator link was hidden on mobile by an existing positional CSS rule. The link was moved outside those hidden positions, and the production markup and route were checked again. A visual mobile browser test remains open.
- Production Google OAuth, cloud reload, real-domain deployments, and the fresh-chat persona test remain open.

## Week 14 synthetic persona pass

Laura, a synthetic condominium coordinator, reviewed three preview screenshots. She correctly identified that the simulated Site scenario fell MXN 440 short, but paused at the pre-fee savings and the ratio. The main confusion was seeing “Guardar escenario” in a demo that discards changes on reload. She also had difficulty distinguishing two same-name saved rows. The screenshots did not show a reload and reopen.

The demo button now says “Guardar solo para esta prueba,” with a Google sign-in hint when available. The empty list explains that demo entries can be opened until reload. The signed-in button still says “Guardar escenario.” Live persona retest pending.
