-- Portfolio value history: one row per user per day, upserted whenever the
-- Overview page loads. Substitutes for a candle-based historical chart since
-- Finnhub's free tier doesn't include the /stock/candle endpoint.

create table public.portfolio_value_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  total_value numeric(18, 2) not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index portfolio_value_history_user_id_idx on public.portfolio_value_history(user_id, date);

alter table public.portfolio_value_history enable row level security;

create policy "portfolio value history is managed by owner"
  on public.portfolio_value_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.portfolio_value_history to authenticated;
