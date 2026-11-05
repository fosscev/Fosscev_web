-- Atomic, server-only rate limiting for application API routes.
-- The application HMACs each identifier before passing it to this function,
-- so this table does not store raw email addresses or client IP addresses.

create table if not exists public.api_rate_limits (
  action text not null,
  identifier_hash text not null,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  primary key (action, identifier_hash)
);

alter table public.api_rate_limits enable row level security;
revoke all on table public.api_rate_limits from public, anon, authenticated;
grant all on table public.api_rate_limits to service_role;

create or replace function public.check_rate_limit(
  p_identifier text,
  p_action text,
  p_max_requests integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_count integer;
begin
  if p_identifier is null or length(p_identifier) <> 64
     or p_action is null or length(p_action) < 1 or length(p_action) > 64
     or p_max_requests < 1 or p_window_seconds < 1 then
    raise exception 'Invalid rate limit parameters';
  end if;

  insert into public.api_rate_limits as current_limit
    (action, identifier_hash, window_started_at, request_count)
  values
    (p_action, p_identifier, v_now, 1)
  on conflict (action, identifier_hash) do update
    set window_started_at = case
          when current_limit.window_started_at <= v_now - make_interval(secs => p_window_seconds)
            then v_now
          else current_limit.window_started_at
        end,
        request_count = case
          when current_limit.window_started_at <= v_now - make_interval(secs => p_window_seconds)
            then 1
          else current_limit.request_count + 1
        end
  returning request_count into v_count;

  -- Opportunistically remove expired keys to keep storage bounded.
  if mod(extract(epoch from v_now)::bigint, 257) = 0 then
    delete from public.api_rate_limits
    where window_started_at < v_now - interval '1 day';
  end if;

  return v_count <= p_max_requests;
end;
$$;

revoke all on function public.check_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, text, integer, integer) to service_role;
