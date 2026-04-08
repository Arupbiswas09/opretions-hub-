# Supabase Realtime (Phase 0)

Enable publication for these tables in the [Supabase Dashboard](https://supabase.com/dashboard) → **Project** → **Database** → **Replication** (or **Realtime** settings), so clients can subscribe to changes:

- `public.tasks`
- `public.approvals`
- `public.notifications`
- `public.messages`

Steps (UI may vary slightly by Supabase version):

1. Open **Database** → **Publications** (or Realtime **Source** configuration).
2. Ensure the `supabase_realtime` publication includes the tables above (toggle each table on).
3. For RLS: Realtime respects the same policies as REST; clients must be authenticated and policies must allow `SELECT` on rows the user should receive.

Schema and RLS for these tables live in `migrations/00001_hub_erp_core.sql`.
