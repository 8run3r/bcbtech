-- Marketing campaigns with click tracking
create table if not exists marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  media_url text,                          -- photo or video URL
  media_type text default 'image' check (media_type in ('image', 'video')),
  cta_text text default 'Zistiť viac',
  cta_url text,                            -- destination URL on CTA click
  bg_color text default '#000000',
  accent_color text default '#7B61FF',
  status text default 'active' check (status in ('active', 'paused', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists campaign_clicks (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references marketing_campaigns(id) on delete cascade,
  clicked_at timestamptz default now(),
  ip text,
  user_agent text,
  referrer text,
  country text,
  device text                              -- mobile / desktop / tablet
);

-- Indexes for analytics queries
create index if not exists idx_clicks_campaign on campaign_clicks(campaign_id);
create index if not exists idx_clicks_date on campaign_clicks(clicked_at);

-- RLS: public read for active campaigns, admin write
alter table marketing_campaigns enable row level security;
alter table campaign_clicks enable row level security;

create policy "Public can read active campaigns"
  on marketing_campaigns for select
  using (status = 'active');

create policy "Anyone can insert clicks"
  on campaign_clicks for insert
  with check (true);

create policy "Public can read clicks"
  on campaign_clicks for select
  using (true);

-- Admin policies (authenticated users)
create policy "Admins can manage campaigns"
  on marketing_campaigns for all
  using (auth.role() = 'authenticated');

create policy "Admins can manage clicks"
  on campaign_clicks for all
  using (auth.role() = 'authenticated');
