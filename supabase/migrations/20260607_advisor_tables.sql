-- Advisor conversations (one per session/topic)
create table public.advisor_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  brand_id uuid references public.brands(id) on delete cascade not null,
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages within a conversation
create table public.advisor_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.advisor_conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  message_type text not null default 'text' check (message_type in ('text', 'video_analysis')),
  video_url text,
  analysis_json jsonb,
  created_at timestamptz default now()
);

-- RLS
alter table public.advisor_conversations enable row level security;
alter table public.advisor_messages enable row level security;

create policy "Users access own conversations"
  on public.advisor_conversations for all
  using (user_id = auth.uid());

create policy "Users access messages in own conversations"
  on public.advisor_messages for all
  using (
    exists (
      select 1 from public.advisor_conversations c
      where c.id = advisor_messages.conversation_id
        and c.user_id = auth.uid()
    )
  );

-- Indexes
create index on public.advisor_messages(conversation_id, created_at);
create index on public.advisor_conversations(user_id, updated_at desc);
