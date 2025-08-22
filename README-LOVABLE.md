# Champion Agent Patch (Lovable Import)
This zip contains the Netlify Functions, migrations, and utilities you can drop into your Lovable project.

## How to use
1. Unzip into your project root. Keep paths as-is (apps/web/... and supabase/...). If your structure differs, move files accordingly.
2. Ensure **Netlify** function directory points at `apps/web/netlify/functions` (in your Netlify UI or `netlify.toml`).
3. Set environment variables in Netlify:
   - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
   - GOOGLE_* / MICROSOFT_* / SALESFORCE_* / HUBSPOT_* (see code)
   - PUBLIC_SITE_URL (your site origin)
4. In Supabase, run migrations in order (new ones in `supabase/migrations`).
5. In Supabase Realtime, enable replication on `public.champions` and `public.events`.
6. Deploy. Scheduled functions defined in `apps/web/netlify.toml` will activate on Netlify.
7. Import the Postman collection from `postman/ChampionAgent.postman_collection.json` to exercise endpoints.
8. UI: call the `sendEmail` hook and CRM Import buttons as wired in your pages.

## Redirect URIs
Configure provider redirect URIs to the function callbacks:
- /.netlify/functions/oauth-salesforce?mode=callback
- /.netlify/functions/oauth-hubspot?mode=callback
- /.netlify/functions/oauth-google?mode=callback
- /.netlify/functions/oauth-microsoft?mode=callback
