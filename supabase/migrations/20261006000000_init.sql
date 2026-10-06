-- 환율 수집 결과와 앱 설정 (01 문서 2.4, 03 문서 4.2)
-- 앱은 anon 키로 읽기만 한다. 쓰기는 서버(Edge Function, service role)만 한다.

create table public.exchange_rates (
  currency     text        not null,
  rate_date    date        not null,
  source       text        not null,
  -- 1 외화 단위당 원화 (02 문서 V-07, V-09). 앱은 정밀도 보존을 위해 rate::text로 읽는다
  rate         numeric(20, 8) not null check (rate > 0),
  -- 송금 보낼 때 환율. 카드 결제 추정용 (02 문서 V-18)
  tts          numeric(20, 8) check (tts > 0),
  effective_at timestamptz not null,
  fetched_at   timestamptz not null default now(),
  primary key (currency, rate_date, source)
);

create index exchange_rates_currency_effective_idx
  on public.exchange_rates (currency, effective_at desc);

alter table public.exchange_rates enable row level security;

create policy "exchange_rates are readable by everyone"
  on public.exchange_rates for select
  to anon, authenticated
  using (true);

-- 강제 업데이트 등 앱 전역 설정 (03 문서 4.2)
create table public.app_config (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_config enable row level security;

create policy "app_config is readable by everyone"
  on public.app_config for select
  to anon, authenticated
  using (true);

insert into public.app_config (key, value)
values ('min_supported_version', '"0.1.0"');
