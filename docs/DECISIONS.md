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

## Week 14 session close

- Use one calculator route with an explicit fictional example and two independent results for the first month and recurring cost.
- Keep calculator scenario snapshots and buyer signals separate from leak records. Google sessions and owner-scoped RLS gate cloud storage.
- The initial mobile header hid the calculator because its second navigation link is suppressed by the existing mobile rules. Moved the calculator past those hidden positions and compacted the mobile header.
- The branch contains the Week 14 packet before implementation. Week 12's packet is preserved as `PACKET-week12.md`.
- Next move: push this branch, apply the pricing migration and OAuth redirect, then run the live sign-in and reload checks before the persona test.

## Week 14 persona follow-up

- Clarified temporary saving where Laura makes the decision to save. Display the Google sign-in hint when account storage is configured.
- Next move: reopen the branch preview, retest the demo wording and confirm the signed-in scenario can be reopened after reload.


## Week 15 pre-build decision — November 19, 2026

- Distribution audience: Mexican coordinators reconciling WhatsApp and Excel who can arrange manual capture. Committee members are buyers, not the primary workflow user.
- Use honest claim: manually captured reports can be organized into next actions and verification status; do not claim automatic WhatsApp detection or proven real-world time savings.
- Three recurring content series, six concepts and three assets across at least two formats. Human approves each asset.
- Public call to action goes to the existing fictional demo. Do not collect personal contact data until a secure consent-based flow is reviewed.
- Preserve Week 14 pricing calculator, authenticated data and historical deployment/commit evidence. No fake outreach, metrics or bugs.
- Test plan and release gates are in the Week 15 addendum to PACKET.md, committed before feature changes.
- Next move: implement the landing-page distribution path and creative assets, run mechanical checks, then fresh-chat synthetic persona and actual opt-in audience outreach; record only observed results.
