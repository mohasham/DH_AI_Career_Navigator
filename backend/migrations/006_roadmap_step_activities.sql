-- ============================================================
-- Migration 006 — Roadmap step activities (self-reported progress)
--
-- Lets a user log specific activities they did toward a roadmap
-- step (a project, a video course, an article, a practice
-- exercise). Each activity type contributes a fixed point value
-- toward that skill's assessed_level, summed and capped at 80
-- total from self-reported activity alone — only a real,
-- quiz-based assessment (Sprint 3) can push a skill's score above
-- 80. This directly addresses supervisor feedback that a bare
-- "mark complete" checkbox reaching 100% was meaningless: now
-- self-reported effort has structure, evidence, and a ceiling
-- below true verified mastery.
-- ============================================================

create table roadmap_step_activities (
  id serial primary key,
  step_id int not null references roadmap_steps(id) on delete cascade,
  activity_type text not null, -- 'project' | 'video' | 'article' | 'exercise'
  description text,
  points int not null,
  created_at timestamp with time zone default now()
);

alter table roadmap_step_activities enable row level security;

create policy "Users can view own step activities"
  on roadmap_step_activities for select using (
    exists (
      select 1 from roadmap_steps rs
      join roadmaps r on r.id = rs.roadmap_id
      where rs.id = roadmap_step_activities.step_id
      and r.profile_id = auth.uid()
    )
  );

create policy "Users can manage own step activities"
  on roadmap_step_activities for all using (
    exists (
      select 1 from roadmap_steps rs
      join roadmaps r on r.id = rs.roadmap_id
      where rs.id = roadmap_step_activities.step_id
      and r.profile_id = auth.uid()
    )
  );