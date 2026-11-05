# Implementation decisions - Week 12

## Week 13 session close — November 4, 2026

- Preserve the original Week 12 packet. The Week 13 pre-code packet and mockup are in `docs/week13/`, committed before feature code.
- Keep Next.js, React, Tailwind, Supabase and the existing Vercel URL.
- Assignment and acceptance are separate. Reassignment clears previous acceptance; record response source/date manually. There is no WhatsApp synchronization.
- Add immutable versioned snapshots and minimal categorical events; database triggers write successful-change history/events in the case transaction. Clients can submit only opening/blocked-verification interaction events.
- Apply owner RLS to cases/history/events. Use optimistic versions to reject stale API updates. No personal information belongs in analytics or demo seeds.
- Keep the existing repair/test/household-confirmation safeguards. Do not infer success from a technician report.
- Cloud persistence needs the incremental migration; memory-only demo behavior remains labeled.
- Local test results and limitations are in `docs/week13/TEST_RESULTS.md`. No production deployment, real-user research or persona session has happened in this session.
- Tomorrow's first move: connect GitHub and Vercel, check remote changes, confirm existing Supabase configuration, apply the reviewed incremental migration, deploy and verify the live cloud path and two-account isolation. Complete browser/persona QA before claiming the ship works.
- Commit completed changes locally. Push is pending authentication; never describe the public URL as updated until deployment is verified.

- Build with Next.js / React and Tailwind for Vercel.
- Use Supabase Auth Google sign-in and a user-token API route.
  Server authorization verifies the token with Supabase getUser.
- Apply ownership filters and PostgreSQL RLS; no service-role key.
- Enforce verified closure both in server validation and DB constraints.
- Keep repairs pending unless a coordinator explicitly confirms closure
  with complete evidence and household confirmation.
- A normal follow-up save conservatively returns a repaired case to
  verification pending; it does not silently reaffirm an old closure.
- If continued loss is reported, save reopened with a reason and next action.
- Include a clearly labeled fictional demo kept only in memory, so
  an unconfigured deployment does not misrepresent cloud persistence.
- Demo counts are fictional records, not real resolution outcomes.
- Do not replace the user's pre-build planning documents with newly
  reconstructed or backdated versions.

## Next action

Upload the source to GitHub, configure a new Supabase project, execute
the SQL, connect Google auth and deploy on Vercel. Verify the deployed
workflow and access isolation before using any real information.

## Not completed

External account setup, SQL execution on live Supabase, Google OAuth,
domain purchase, Vercel deployments, real-user research and 10:1 testing.
