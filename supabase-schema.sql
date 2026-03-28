-- ReviewPulse Database Schema
-- Run this in the Supabase SQL Editor

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  business_name text,
  email text,
  plan text default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text,
  created_at timestamptz default now()
);

-- Business locations
create table public.locations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  address text,
  google_place_id text,
  connected boolean default false,
  created_at timestamptz default now()
);

-- Reviews
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  location_id uuid references public.locations on delete cascade not null,
  source text not null check (source in ('google', 'yelp', 'facebook')),
  external_review_id text,
  rating integer check (rating >= 1 and rating <= 5),
  reviewer_name text,
  review_text text,
  review_url text,
  responded boolean default false,
  response_text text,
  sentiment text default 'neutral' check (sentiment in ('positive', 'neutral', 'negative')),
  fetched_at timestamptz default now()
);

-- Response templates
create table public.response_templates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  template_text text not null,
  sentiment_filter text check (sentiment_filter in ('positive', 'neutral', 'negative', 'all')),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.reviews enable row level security;
alter table public.response_templates enable row level security;

-- RLS Policies: users can only see their own data
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users can view own locations" on public.locations for select using (auth.uid() = user_id);
create policy "Users can insert own locations" on public.locations for insert with check (auth.uid() = user_id);
create policy "Users can update own locations" on public.locations for update using (auth.uid() = user_id);
create policy "Users can delete own locations" on public.locations for delete using (auth.uid() = user_id);

create policy "Users can view own reviews" on public.reviews for select using (
  location_id in (select id from public.locations where user_id = auth.uid())
);
create policy "Users can insert own reviews" on public.reviews for insert with check (
  location_id in (select id from public.locations where user_id = auth.uid())
);
create policy "Users can update own reviews" on public.reviews for update using (
  location_id in (select id from public.locations where user_id = auth.uid())
);

create policy "Users can view own templates" on public.response_templates for select using (auth.uid() = user_id);
create policy "Users can insert own templates" on public.response_templates for insert with check (auth.uid() = user_id);
create policy "Users can update own templates" on public.response_templates for update using (auth.uid() = user_id);
create policy "Users can delete own templates" on public.response_templates for delete using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes for performance
create index idx_locations_user_id on public.locations(user_id);
create index idx_reviews_location_id on public.reviews(location_id);
create index idx_reviews_sentiment on public.reviews(sentiment);
create index idx_reviews_fetched_at on public.reviews(fetched_at);
