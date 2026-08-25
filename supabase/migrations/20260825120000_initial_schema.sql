-- =============================================================================
-- Service Flow Pro — schema inicial (baseline)
-- =============================================================================
-- ATENÇÃO: este baseline foi RECONSTRUÍDO a partir das queries em src/hooks/.
-- O projeto Supabase em produção foi criado pela UI e pode divergir em tipos,
-- defaults e constraints. Antes de aplicar em um banco existente, compare com
-- `supabase db diff`. Em um projeto novo, ele levanta o schema completo.
--
-- Nomes de tabelas/colunas seguem exatamente o que o frontend espera — mudar
-- qualquer identificador aqui quebra os hooks correspondentes.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Utilidades
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
-- 1:1 com auth.users. useProfile() faz .single() e trata a ausência da linha
-- como erro, por isso o trigger handle_new_user (no fim do arquivo) é
-- obrigatório: RegisterPage.tsx só chama auth.signUp() e nunca insere aqui.

create table if not exists public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  name               text,
  email              text,
  phone              text,
  document           text,
  avatar_url         text,
  use_logo_for_print boolean not null default true,
  birth_date         date,
  cep                text,
  street             text,
  number             text,
  complement         text,
  neighborhood       text,
  city               text,
  state              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- clients
-- -----------------------------------------------------------------------------

create table if not exists public.clients (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  name          text not null,
  email         text,
  phone         text,
  document      text,
  birth_date    date,
  custom_fields jsonb not null default '{}'::jsonb,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists clients_user_id_idx on public.clients (user_id);
create index if not exists clients_created_at_idx on public.clients (created_at desc);

create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- client_addresses
-- -----------------------------------------------------------------------------
-- Sem user_id: a posse vem de clients. useClients() regrava o conjunto inteiro
-- (delete + insert) a cada update, então o cascade abaixo é essencial.

create table if not exists public.client_addresses (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients (id) on delete cascade,
  label        text,
  cep          text,
  street       text,
  number       text,
  complement   text,
  neighborhood text,
  city         text,
  state        text,
  is_default   boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists client_addresses_client_id_idx
  on public.client_addresses (client_id);

-- -----------------------------------------------------------------------------
-- services
-- -----------------------------------------------------------------------------

create table if not exists public.services (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  name          text not null,
  description   text,
  price         numeric(12, 2) not null default 0,
  active        boolean not null default true,
  custom_fields jsonb not null default '{}'::jsonb,
  image_url     text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists services_user_id_idx on public.services (user_id);
create index if not exists services_created_at_idx on public.services (created_at desc);

create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- service_orders
-- -----------------------------------------------------------------------------
-- `number` é apenas exibido pelo frontend, nunca gravado — OrdersPage.tsx usa
-- `order.number || order.id.slice(0, 4)`. Fica nullable de propósito; se quiser
-- numeração sequencial, adicione um default por sequence em migration própria.

create table if not exists public.service_orders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  client_id     uuid references public.clients (id) on delete cascade,
  number        text,
  status        text not null default 'start'
                  check (status in ('start', 'progress', 'waiting', 'cancelled', 'finished')),
  priority      text not null default 'normal'
                  check (priority in ('low', 'normal', 'high')),
  total         numeric(12, 2) not null default 0,
  discount      numeric(12, 2) not null default 0,
  description   text,
  observations  text,
  scheduled_at  timestamptz,
  custom_fields jsonb not null default '{}'::jsonb,
  image_url     text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists service_orders_user_id_idx on public.service_orders (user_id);
create index if not exists service_orders_client_id_idx on public.service_orders (client_id);
create index if not exists service_orders_created_at_idx on public.service_orders (created_at desc);

create trigger service_orders_set_updated_at
  before update on public.service_orders
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- order_items
-- -----------------------------------------------------------------------------

create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.service_orders (id) on delete cascade,
  name       text not null,
  quantity   integer not null default 1 check (quantity > 0),
  price      numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- -----------------------------------------------------------------------------
-- transactions
-- -----------------------------------------------------------------------------

create table if not exists public.transactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  order_id   uuid references public.service_orders (id) on delete cascade,
  amount     numeric(12, 2) not null,
  date       date not null default current_date,
  type       text not null default 'received' check (type in ('received', 'pending')),
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_id_idx on public.transactions (user_id);
create index if not exists transactions_order_id_idx on public.transactions (order_id);

-- -----------------------------------------------------------------------------
-- custom_field_definitions
-- -----------------------------------------------------------------------------

create table if not exists public.custom_field_definitions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  entity_type text not null check (entity_type in ('client', 'service', 'order')),
  name        text not null,
  type        text not null check (type in (
                'text', 'number', 'date', 'select', 'textarea', 'checkbox',
                'email', 'phone', 'document', 'zip', 'plate', 'multiselect'
              )),
  required    boolean not null default false,
  options     text[],
  placeholder text,
  order_index integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists custom_field_definitions_lookup_idx
  on public.custom_field_definitions (user_id, entity_type, order_index);

-- =============================================================================
-- Row Level Security
-- =============================================================================
-- Todo acesso é feito com a anon key + sessão do usuário, então RLS é a única
-- barreira entre os dados de tenants diferentes.

alter table public.profiles                 enable row level security;
alter table public.clients                  enable row level security;
alter table public.client_addresses         enable row level security;
alter table public.services                 enable row level security;
alter table public.service_orders           enable row level security;
alter table public.order_items              enable row level security;
alter table public.transactions             enable row level security;
alter table public.custom_field_definitions enable row level security;

-- profiles: cada usuário enxerga apenas o próprio perfil.
create policy "profiles: select own" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles: insert own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

-- Tabelas com user_id direto.
create policy "clients: all own" on public.clients
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "services: all own" on public.services
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "service_orders: all own" on public.service_orders
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "transactions: all own" on public.transactions
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "custom_field_definitions: all own" on public.custom_field_definitions
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tabelas filhas: a posse é herdada do pai.
create policy "client_addresses: all via client" on public.client_addresses
  for all to authenticated
  using (
    exists (
      select 1 from public.clients c
      where c.id = client_addresses.client_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.clients c
      where c.id = client_addresses.client_id and c.user_id = auth.uid()
    )
  );

create policy "order_items: all via order" on public.order_items
  for all to authenticated
  using (
    exists (
      select 1 from public.service_orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.service_orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- =============================================================================
-- Criação automática do perfil no signup
-- =============================================================================
-- RegisterPage.tsx envia full_name/phone/document em options.data, que o
-- Supabase grava em raw_user_meta_data.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, phone, document)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'document'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Preenche perfis de usuários que já existiam antes deste trigger.
insert into public.profiles (id, email, name, phone, document)
select
  u.id,
  u.email,
  u.raw_user_meta_data ->> 'full_name',
  u.raw_user_meta_data ->> 'phone',
  u.raw_user_meta_data ->> 'document'
from auth.users u
on conflict (id) do nothing;
