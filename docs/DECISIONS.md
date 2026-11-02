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
