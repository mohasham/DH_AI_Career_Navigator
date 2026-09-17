-- ============================================================
-- AI Career Navigator — Database Schema
-- Generated from the approved ERD
-- Run this in Supabase: Project > SQL Editor > New Query
-- ============================================================

-- ------------------------------------------------------------
-- profiles
-- One row per user, id matches Supabase auth.users.id
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  education text,
  experience_years int,
  interests text,
  career_goal text,
  work_preference text,
  industry_interest text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ------------------------------------------------------------
-- skills
-- Master list of all skills used across assessments and careers
-- ------------------------------------------------------------
create table skills (
  id serial primary key,
  name text not null,
  category text,
  description text
);

-- ------------------------------------------------------------
-- user_skills
-- A user's self-rated and assessed level per skill
-- ------------------------------------------------------------
create table user_skills (
  id serial primary key,
  profile_id uuid not null references profiles(id) on delete cascade,
  skill_id int not null references skills(id) on delete cascade,
  self_rating int,
  assessed_level int,
  source text, -- 'self' | 'tested' | 'demonstrated'
  updated_at timestamp with time zone default now()
);

-- ------------------------------------------------------------
-- careers
-- Career definitions sourced from ESCO / O*NET
-- ------------------------------------------------------------
create table careers (
  id serial primary key,
  title text not null,
  description text,
  industry text,
  source text -- 'ESCO' | 'O*NET'
);

-- ------------------------------------------------------------
-- career_skills
-- Required skill levels per career
-- ------------------------------------------------------------
create table career_skills (
  id serial primary key,
  career_id int not null references careers(id) on delete cascade,
  skill_id int not null references skills(id) on delete cascade,
  required_level int,
  importance int
);

-- ------------------------------------------------------------
-- questions
-- Question bank used for skill assessments
-- ------------------------------------------------------------
create table questions (
  id serial primary key,
  skill_id int not null references skills(id) on delete cascade,
  question_text text not null,
  options jsonb,
  correct_answer text,
  difficulty text -- 'easy' | 'medium' | 'hard'
);

-- ------------------------------------------------------------
-- assessments
-- One assessment session per user per skill
-- ------------------------------------------------------------
create table assessments (
  id serial primary key,
  profile_id uuid not null references profiles(id) on delete cascade,
  skill_id int not null references skills(id) on delete cascade,
  score int,
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- ------------------------------------------------------------
-- assessment_answers
-- Individual answers within an assessment session
-- ------------------------------------------------------------
create table assessment_answers (
  id serial primary key,
  assessment_id int not null references assessments(id) on delete cascade,
  question_id int not null references questions(id) on delete cascade,
  user_answer text,
  is_correct boolean
);

-- ------------------------------------------------------------
-- career_matches
-- Calculated compatibility score per user per career
-- ------------------------------------------------------------
create table career_matches (
  id serial primary key,
  profile_id uuid not null references profiles(id) on delete cascade,
  career_id int not null references careers(id) on delete cascade,
  compatibility_score int,
  calculated_at timestamp with time zone default now()
);

-- ------------------------------------------------------------
-- roadmaps
-- A generated roadmap per user per target career
-- ------------------------------------------------------------
create table roadmaps (
  id serial primary key,
  profile_id uuid not null references profiles(id) on delete cascade,
  career_id int not null references careers(id) on delete cascade,
  readiness_percentage int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ------------------------------------------------------------
-- roadmap_steps
-- Ordered steps within a roadmap
-- ------------------------------------------------------------
create table roadmap_steps (
  id serial primary key,
  roadmap_id int not null references roadmaps(id) on delete cascade,
  skill_id int references skills(id),
  step_order int,
  title text,
  description text,
  resource_url text,
  is_completed boolean default false,
  completed_at timestamp with time zone
);

-- ------------------------------------------------------------
-- chat_sessions
-- One chat session per user (can have multiple over time)
-- ------------------------------------------------------------
create table chat_sessions (
  id serial primary key,
  profile_id uuid not null references profiles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- ------------------------------------------------------------
-- chat_messages
-- Individual messages within a chat session
-- ------------------------------------------------------------
create table chat_messages (
  id serial primary key,
  session_id int not null references chat_sessions(id) on delete cascade,
  role text, -- 'user' | 'assistant'
  content text,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- Ensures users can only access their own data.
-- Required by the capstone security checklist.
-- ============================================================

alter table profiles enable row level security;
alter table user_skills enable row level security;
alter table assessments enable row level security;
alter table assessment_answers enable row level security;
alter table career_matches enable row level security;
alter table roadmaps enable row level security;
alter table roadmap_steps enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;

-- skills, careers, career_skills, questions stay public/readable —
-- they are shared reference data, not user-specific.
alter table skills enable row level security;
alter table careers enable row level security;
alter table career_skills enable row level security;
alter table questions enable row level security;

-- ------------------------------------------------------------
-- Policies: users can only see/edit their own rows
-- ------------------------------------------------------------

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can view own skills"
  on user_skills for select using (auth.uid() = profile_id);
create policy "Users can manage own skills"
  on user_skills for all using (auth.uid() = profile_id);

create policy "Users can view own assessments"
  on assessments for select using (auth.uid() = profile_id);
create policy "Users can manage own assessments"
  on assessments for all using (auth.uid() = profile_id);

create policy "Users can view own assessment answers"
  on assessment_answers for select using (
    exists (
      select 1 from assessments
      where assessments.id = assessment_answers.assessment_id
      and assessments.profile_id = auth.uid()
    )
  );

create policy "Users can view own matches"
  on career_matches for select using (auth.uid() = profile_id);
create policy "Users can manage own matches"
  on career_matches for all using (auth.uid() = profile_id);

create policy "Users can view own roadmaps"
  on roadmaps for select using (auth.uid() = profile_id);
create policy "Users can manage own roadmaps"
  on roadmaps for all using (auth.uid() = profile_id);

create policy "Users can view own roadmap steps"
  on roadmap_steps for select using (
    exists (
      select 1 from roadmaps
      where roadmaps.id = roadmap_steps.roadmap_id
      and roadmaps.profile_id = auth.uid()
    )
  );
create policy "Users can manage own roadmap steps"
  on roadmap_steps for all using (
    exists (
      select 1 from roadmaps
      where roadmaps.id = roadmap_steps.roadmap_id
      and roadmaps.profile_id = auth.uid()
    )
  );

create policy "Users can view own chat sessions"
  on chat_sessions for select using (auth.uid() = profile_id);
create policy "Users can manage own chat sessions"
  on chat_sessions for all using (auth.uid() = profile_id);

create policy "Users can view own chat messages"
  on chat_messages for select using (
    exists (
      select 1 from chat_sessions
      where chat_sessions.id = chat_messages.session_id
      and chat_sessions.profile_id = auth.uid()
    )
  );
create policy "Users can manage own chat messages"
  on chat_messages for all using (
    exists (
      select 1 from chat_sessions
      where chat_sessions.id = chat_messages.session_id
      and chat_sessions.profile_id = auth.uid()
    )
  );

-- Reference tables: readable by any authenticated user, not editable by users
create policy "Anyone can read skills"
  on skills for select using (true);
create policy "Anyone can read careers"
  on careers for select using (true);
create policy "Anyone can read career_skills"
  on career_skills for select using (true);
create policy "Anyone can read questions"
  on questions for select using (true);
