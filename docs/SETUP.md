# Agua en seguimiento - Setup

## 1. Upload source to the existing GitHub repository

Extract the ZIP. Upload the contents of its `agua-en-seguimiento` folder
to the ROOT of `isabellazevada/agua-en-seguimiento`, next to README.md.
Do not upload the ZIP itself or a surrounding folder. Preserve the
existing CHARTER.md, PERSONAS.md, PACKET.md and mockup in docs.
This package adds docs/SETUP.md, docs/TEST_RESULTS.md and
docs/DECISIONS.md, without replacing those planning documents.

The root must contain package.json, package-lock.json, app, lib,
supabase, tests, next.config.mjs and postcss.config.mjs.

## 2. Create Supabase project

Use a free project. Save its database password privately.
Open SQL Editor and run supabase/001_cases.sql once in the new project.
It creates the cases table, RLS policies and closure constraints.
No seed inserts or personal data are included.

In the project settings, obtain Project URL and publishable key.
The application uses only these public client credentials plus the
signed-in user's token. No service-role key is needed.

## 3. Import GitHub repository in Vercel

Select the Next.js framework, repository root directory, npm install
and npm run build (defined in package.json).
Add these environment variables:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

Use the values from your Supabase project. Do not paste private keys
in GitHub or chat. Redeploy after changing environment variables.
Without the two values, the temporary demo remains usable but cloud
storage and Google sign-in are unavailable.

## 4. Google sign-in

Configure Google's provider in Supabase Authentication > Providers.
Create an OAuth web client in the venture's Google Cloud project.
Use the Supabase callback URL shown in its Google provider settings
as the Google client's authorized redirect URI.
Enter the Google OAuth client ID and client secret ONLY in Supabase's
provider configuration. Enable the provider.

In Supabase Authentication > URL Configuration, set Site URL to the
deployed origin, and allow the exact production URL ending /product.
Add the purchased domain's /product URL when it is connected.
If the OAuth consent screen is in testing, add the testing accounts.
No paid Google API or AI API is required by this application.

## 5. Connect domain

Purchase the venture's domain using its venture Gmail as required
by the assignment. In Vercel, add it under project Domains and apply
the exact DNS records Vercel supplies at the registrar.
Update Supabase URLs and redeploy if needed. Verify HTTPS, homepage,
/product and /about from the purchased domain before submitting.
Domain ownership, purchase and connection have not been performed here.

## 6. Verify actual cloud storage

Sign in using Google, create a fictional H-004, save and reload.
Open a second authenticated account and confirm H-004 is inaccessible.
Try an invalid verified closure directly against the database as an
authenticated user: constraints must reject it.
Never disable RLS to work around an access error.

Cloud mode only displays successful saving after Supabase responds.
Demo mode keeps fictional examples in memory; reload resets it.
No real household contact information is requested.

## 7. Required course evidence

The existing planning commits remain in GitHub. Add meaningful
implementation commits and actual corrections; do not create fake
history. Record actual commit hashes and at least two successful
deployments, with the second after a real change or fix.
Complete the live mechanical pass and fresh-chat synthetic-persona
walkthrough. Record observed problems, changes and retest outcomes.
Make the 3-minute demo plus final 30-second reflection, and assemble
the packet, persona log and full build conversation PDFs.

## Local checks

npm ci
npm test
npm run build
npm run dev

Use .env.local for local public Supabase configuration, never commit it.

## References

https://nextjs.org/docs/app/getting-started/installation
https://github.com/supabase/supabase-js
https://supabase.com/docs/guides/auth/social-login/auth-google
https://supabase.com/docs/guides/database/postgres/row-level-security

The runtime package versions are recorded in package-lock.json.
