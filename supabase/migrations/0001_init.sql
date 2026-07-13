-- MarketCap initial schema: profiles, portfolios, holdings, watchlist,
-- shared market-data caches, and a minimal community feed.

-- ============================================================
-- profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  theme_preference text not null default 'system' check (theme_preference in ('light', 'dark', 'system')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- portfolios
-- ============================================================
create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My Portfolio',
  created_at timestamptz not null default now()
);

create index portfolios_user_id_idx on public.portfolios(user_id);

alter table public.portfolios enable row level security;

create policy "portfolios are managed by owner"
  on public.portfolios for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- holdings
-- ============================================================
create table public.holdings (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  shares numeric(18, 6) not null check (shares > 0),
  cost_basis numeric(18, 4) not null check (cost_basis >= 0),
  purchase_date date not null,
  notes text,
  created_at timestamptz not null default now()
);

create index holdings_portfolio_id_idx on public.holdings(portfolio_id);
create index holdings_user_id_idx on public.holdings(user_id);
create index holdings_symbol_idx on public.holdings(symbol);

alter table public.holdings enable row level security;

create policy "holdings are managed by owner"
  on public.holdings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- watchlist_items
-- ============================================================
create table public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  added_at timestamptz not null default now(),
  unique (user_id, symbol)
);

create index watchlist_items_user_id_idx on public.watchlist_items(user_id);

alter table public.watchlist_items enable row level security;

create policy "watchlist items are managed by owner"
  on public.watchlist_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- stock_metadata_cache (shared, long TTL, service-role write)
-- ============================================================
create table public.stock_metadata_cache (
  symbol text primary key,
  company_name text,
  logo_url text,
  exchange text,
  industry text,
  currency text,
  raw_profile jsonb,
  updated_at timestamptz not null default now()
);

alter table public.stock_metadata_cache enable row level security;

create policy "stock metadata is publicly readable"
  on public.stock_metadata_cache for select
  to authenticated, anon
  using (true);

create policy "stock metadata is written by service role"
  on public.stock_metadata_cache for all
  to service_role
  using (true)
  with check (true);

-- ============================================================
-- quote_cache (shared, short TTL, service-role write)
-- ============================================================
create table public.quote_cache (
  symbol text primary key,
  price numeric(18, 4),
  change numeric(18, 4),
  percent_change numeric(8, 4),
  high numeric(18, 4),
  low numeric(18, 4),
  open numeric(18, 4),
  prev_close numeric(18, 4),
  raw jsonb,
  updated_at timestamptz not null default now()
);

alter table public.quote_cache enable row level security;

create policy "quotes are publicly readable"
  on public.quote_cache for select
  to authenticated, anon
  using (true);

create policy "quotes are written by service role"
  on public.quote_cache for all
  to service_role
  using (true)
  with check (true);

-- ============================================================
-- candle_cache (shared, TTL varies by resolution, service-role write)
-- ============================================================
create table public.candle_cache (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  resolution text not null,
  from_ts bigint not null,
  to_ts bigint not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  unique (symbol, resolution, from_ts, to_ts)
);

create index candle_cache_lookup_idx on public.candle_cache(symbol, resolution, from_ts, to_ts);

alter table public.candle_cache enable row level security;

create policy "candles are publicly readable"
  on public.candle_cache for select
  to authenticated, anon
  using (true);

create policy "candles are written by service role"
  on public.candle_cache for all
  to service_role
  using (true)
  with check (true);

-- ============================================================
-- community_posts / community_post_likes (minimal public feed)
-- ============================================================
create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text,
  body text not null check (char_length(body) <= 500),
  created_at timestamptz not null default now()
);

create index community_posts_created_at_idx on public.community_posts(created_at desc);

alter table public.community_posts enable row level security;

create policy "community posts are readable by authenticated users"
  on public.community_posts for select
  to authenticated
  using (true);

create policy "community posts are insertable by owner"
  on public.community_posts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "community posts are editable by owner"
  on public.community_posts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "community posts are deletable by owner"
  on public.community_posts for delete
  to authenticated
  using (auth.uid() = user_id);

create table public.community_post_likes (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.community_post_likes enable row level security;

create policy "likes are readable by authenticated users"
  on public.community_post_likes for select
  to authenticated
  using (true);

create policy "likes are manageable by owner"
  on public.community_post_likes for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- handle_new_user: create profile + default portfolio on signup
-- ============================================================
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');

  insert into public.portfolios (user_id, name)
  values (new.id, 'My Portfolio');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- grants: table-level privileges for the API roles. RLS policies
-- above scope which rows are visible; without these grants, Postgres
-- denies access before RLS is ever evaluated (Supabase no longer
-- auto-exposes new tables to anon/authenticated/service_role).
-- ============================================================
grant usage on schema public to anon, authenticated, service_role;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.portfolios to authenticated;
grant select, insert, update, delete on public.holdings to authenticated;
grant select, insert, update, delete on public.watchlist_items to authenticated;

grant select on public.stock_metadata_cache to anon, authenticated;
grant select, insert, update, delete on public.stock_metadata_cache to service_role;

grant select on public.quote_cache to anon, authenticated;
grant select, insert, update, delete on public.quote_cache to service_role;

grant select on public.candle_cache to anon, authenticated;
grant select, insert, update, delete on public.candle_cache to service_role;

grant select, insert, update, delete on public.community_posts to authenticated;
grant select, insert, update, delete on public.community_post_likes to authenticated;
