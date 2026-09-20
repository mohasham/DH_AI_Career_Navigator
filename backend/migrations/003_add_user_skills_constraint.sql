-- ============================================================
-- Migration 003 — Add unique constraint to user_skills
--
-- Required for the assessment scoring endpoint's upsert logic:
-- when a user retakes an assessment for a skill they've already
-- been tested on, we want to UPDATE their existing assessed_level
-- rather than create a duplicate row. Postgres needs an explicit
-- unique constraint on (profile_id, skill_id) for "on conflict"
-- upserts to know what counts as a duplicate.
-- ============================================================

alter table user_skills
  add constraint user_skills_profile_skill_unique
  unique (profile_id, skill_id);