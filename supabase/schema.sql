-- Bali Choice — Supabase şeması (5. adım: çok-cihaz + realtime eşleşme).
-- Supabase panelinde: SQL Editor → bu dosyayı yapıştır → Run.
--
-- NOT (v1 güvenlik): Uygulamada auth yok (isim + localStorage uuid). Bu yüzden
-- RLS açık ama policy'ler herkese izin verir. Bu, v1 için kabul edilen bir
-- ödünleşme; üretim/gerçek kullanıcı verisi için sıkılaştırılmalı.

-- Oturumlar
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  topic text not null,
  threshold_type text not null check (threshold_type in ('all','majority','count')),
  threshold_count int,
  host_user_id text not null,
  created_at timestamptz not null default now()
);

-- Katılımcılar
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id text not null,
  name text not null,
  joined_at timestamptz not null default now(),
  unique (session_id, user_id)
);

-- Kartlar (oturum için üretilen deste — tüm cihazlar aynı desteyi görür)
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  osm_id text not null,
  position int not null,
  name text not null,
  category text,
  photo_url text,
  rating real,
  price_level int,
  distance_m int,
  address text,
  open_now boolean,
  unique (session_id, osm_id)
);

-- Oylar (kişi başına kart başına tek; beğen/geç)
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  user_id text not null,
  liked boolean not null,
  created_at timestamptz not null default now(),
  unique (session_id, card_id, user_id)
);

-- Eşleşmeler (eşiğe ulaşan kartlar; realtime ile gruba bildirilir)
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (session_id, card_id)
);

create index if not exists votes_session_idx on public.votes (session_id);
create index if not exists cards_session_idx on public.cards (session_id);
create index if not exists participants_session_idx on public.participants (session_id);

-- RLS: aç ve (v1) herkese izin ver.
alter table public.sessions enable row level security;
alter table public.participants enable row level security;
alter table public.cards enable row level security;
alter table public.votes enable row level security;
alter table public.matches enable row level security;

do $$
declare t text;
begin
  foreach t in array array['sessions','participants','cards','votes','matches']
  loop
    execute format(
      'drop policy if exists %I_all on public.%I;', t || '_anon', t
    );
    execute format(
      'create policy %I on public.%I for all using (true) with check (true);',
      t || '_anon', t
    );
  end loop;
end $$;

-- Realtime: katılımcı/oy/eşleşme değişikliklerini canlı yayınla.
alter publication supabase_realtime add table public.participants;
alter publication supabase_realtime add table public.votes;
alter publication supabase_realtime add table public.matches;
