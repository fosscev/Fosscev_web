# Security deployment notes

## Before deploying

1. Apply `supabase/migrations/202611040001_rate_limit_rpc.sql` to the project database. The application now rejects rate-limited actions if this RPC is unavailable, so apply the migration before deploying the code.
2. Set `SESSION_MARKER_SECRET` in the production environment to a private random value of at least 32 bytes. Do not reuse the Supabase service-role key or commit this value.
3. On Vercel, rate limiting uses Vercel's forwarded client IP headers. On other hosts, set `TRUSTED_CLIENT_IP_HEADER` to a header that only the trusted reverse proxy can write, and prevent direct access to the origin.

## Email templates

Keep the Magic Link template configured to show the one-time code. For the recovery template, use the application's confirmation page as an interstitial so email scanners do not consume the one-time token before the user opens the link:

```html
<a href="{{ .SiteURL }}/foss-manager/reset-password#token_hash={{ .TokenHash }}&amp;type=recovery">Reset Your Password</a>
```

Deploy the application change before using this template. Disable click tracking for authentication email links.

## Database access review

The admin interface uses the browser Supabase client for some direct table and Storage operations. Confirm the Supabase RLS policies and Storage policies restrict those operations to the intended admin identities. The server-side `ADMIN_EMAILS` allowlist is not automatically visible to Postgres policies; keep the database policy allowlist in sync or move those operations behind server endpoints that verify the signed admin session.

## Operational checks

- Review Supabase Auth logs and hosting logs for rejected authentication or delivery requests.
- Confirm rate-limit calls are reaching the `check_rate_limit` RPC and that the `service_role` key is only available server-side.
- Keep the production Content Security Policy active on pages viewed with an admin session. It uses per-request nonces and intentionally avoids applying dynamic rendering to ordinary public visits.
