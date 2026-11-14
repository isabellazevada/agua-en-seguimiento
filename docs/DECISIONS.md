# Implementation decisions - Week 12

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
