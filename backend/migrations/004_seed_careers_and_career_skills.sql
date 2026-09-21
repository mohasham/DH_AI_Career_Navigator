-- ============================================================
-- Seed: Careers + Career Skills
-- Migration 004 — populates career reference data for Sprint 4's
-- career matching and gap analysis features.
--
-- Scope: 6 careers spanning different skill profiles, so matching
-- produces genuinely different results depending on which skills
-- a user has been assessed on. Required levels are set relative
-- to a 0-100 assessed_level scale (matching how scores are stored
-- in user_skills from the assessment feature).
-- ============================================================

-- ------------------------------------------------------------
-- CAREERS
-- ------------------------------------------------------------
insert into careers (title, description, industry, source) values
  ('Data Analyst', 'Analyzes data to find trends and support business decisions using SQL, statistics, and visualization tools.', 'Technology', 'O*NET'),
  ('Data Scientist', 'Builds predictive models and applies statistical and machine learning techniques to solve complex problems.', 'Technology', 'O*NET'),
  ('Full-Stack Developer', 'Builds both the frontend and backend of web applications, working across the entire stack.', 'Technology', 'O*NET'),
  ('Backend Developer', 'Focuses on server-side logic, databases, and APIs that power applications.', 'Technology', 'O*NET'),
  ('Business Intelligence Analyst', 'Turns raw data into dashboards and reports that guide business strategy.', 'Technology', 'O*NET'),
  ('Machine Learning Engineer', 'Designs, builds, and deploys machine learning models into production systems.', 'Technology', 'O*NET');

-- ------------------------------------------------------------
-- CAREER SKILLS — Data Analyst
-- Strong SQL + visualization + some statistics, less coding depth
-- ------------------------------------------------------------
insert into career_skills (career_id, skill_id, required_level, importance)
select c.id, s.id, req.level, req.imp
from careers c
join (values
  ('SQL', 75, 3),
  ('Data Visualization', 70, 3),
  ('Statistics', 60, 2),
  ('Python', 50, 2)
) as req(skill_name, level, imp) on true
join skills s on s.name = req.skill_name
where c.title = 'Data Analyst';

-- ------------------------------------------------------------
-- CAREER SKILLS — Data Scientist
-- Heavy statistics + ML + Python, moderate SQL
-- ------------------------------------------------------------
insert into career_skills (career_id, skill_id, required_level, importance)
select c.id, s.id, req.level, req.imp
from careers c
join (values
  ('Python', 80, 3),
  ('Statistics', 80, 3),
  ('Machine Learning', 75, 3),
  ('SQL', 60, 2),
  ('Data Visualization', 55, 1)
) as req(skill_name, level, imp) on true
join skills s on s.name = req.skill_name
where c.title = 'Data Scientist';

-- ------------------------------------------------------------
-- CAREER SKILLS — Full-Stack Developer
-- Heavy JavaScript, moderate Python + SQL, no ML/stats needed
-- ------------------------------------------------------------
insert into career_skills (career_id, skill_id, required_level, importance)
select c.id, s.id, req.level, req.imp
from careers c
join (values
  ('JavaScript', 85, 3),
  ('SQL', 55, 2),
  ('Python', 40, 1)
) as req(skill_name, level, imp) on true
join skills s on s.name = req.skill_name
where c.title = 'Full-Stack Developer';

-- ------------------------------------------------------------
-- CAREER SKILLS — Backend Developer
-- Balanced Python/JavaScript + strong SQL
-- ------------------------------------------------------------
insert into career_skills (career_id, skill_id, required_level, importance)
select c.id, s.id, req.level, req.imp
from careers c
join (values
  ('Python', 70, 3),
  ('SQL', 75, 3),
  ('JavaScript', 55, 2)
) as req(skill_name, level, imp) on true
join skills s on s.name = req.skill_name
where c.title = 'Backend Developer';

-- ------------------------------------------------------------
-- CAREER SKILLS — Business Intelligence Analyst
-- SQL + visualization heavy, lighter on programming
-- ------------------------------------------------------------
insert into career_skills (career_id, skill_id, required_level, importance)
select c.id, s.id, req.level, req.imp
from careers c
join (values
  ('SQL', 80, 3),
  ('Data Visualization', 75, 3),
  ('Statistics', 50, 2)
) as req(skill_name, level, imp) on true
join skills s on s.name = req.skill_name
where c.title = 'Business Intelligence Analyst';

-- ------------------------------------------------------------
-- CAREER SKILLS — Machine Learning Engineer
-- Highest bar across Python, ML, and statistics
-- ------------------------------------------------------------
insert into career_skills (career_id, skill_id, required_level, importance)
select c.id, s.id, req.level, req.imp
from careers c
join (values
  ('Python', 85, 3),
  ('Machine Learning', 85, 3),
  ('Statistics', 75, 3),
  ('SQL', 55, 1)
) as req(skill_name, level, imp) on true
join skills s on s.name = req.skill_name
where c.title = 'Machine Learning Engineer';