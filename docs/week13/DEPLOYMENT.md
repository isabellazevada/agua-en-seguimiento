# Week 13 — existing project deployment

Preserve the Vercel project serving https://agua-en-seguimiento.vercel.app and repository https://github.com/isabellazevada/agua-en-seguimiento.

1. Review the five local commits and publish them to the existing repository using an authenticated GitHub connection. Confirm the remote has not changed before pushing; reconcile any changes without force-push.
2. Confirm the existing Supabase project and backup/recovery arrangements before running the incremental `supabase/002_week13.sql`. Do not rerun `001_cases.sql` on an existing database. This migration adds columns, owner-scoped tables, constraints, triggers and a baseline history snapshot; it does not delete cases. It is a one-time migration, not idempotent.
3. Confirm the current Vercel project has the existing public Supabase URL/publishable key and Google OAuth redirect configuration. Private service credentials are not needed. No secrets are committed.
4. Deploy the first feature version to the same project. Verify authenticated cloud persistence, history, owner isolation and event records. The demo remains explicitly memory-only.
5. Complete the mechanical and persona pass, fix an actual observed issue, retest and redeploy. Record both actual deployment URLs/timestamps. Do not count local compilation as a deployment.

The first local compilation succeeded; production configuration and deployments remain pending authenticated access.
