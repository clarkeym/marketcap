-- The community feed needs to display other users' names, but profiles
-- was previously readable only by its owner. Widen SELECT to any
-- authenticated user (standard for a social feature); UPDATE stays
-- owner-only.
drop policy if exists "profiles are viewable by owner" on public.profiles;

create policy "profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);
