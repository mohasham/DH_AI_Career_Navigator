-- ============================================================
-- Migration 005 — Backfill missing resource_url values
--
-- Fills in real, curated learning resource links for any
-- roadmap_steps rows saved before the SKILL_RESOURCES lookup
-- was added to the roadmap generation endpoint. Preserves
-- everything else about each row — only updates resource_url
-- where it was previously null.
-- ============================================================

update roadmap_steps rs
set resource_url = case
  (select s.name from skills s where s.id = rs.skill_id)
  when 'Python' then 'https://docs.python.org/3/tutorial/'
  when 'SQL' then 'https://www.w3schools.com/sql/'
  when 'JavaScript' then 'https://developer.mozilla.org/en-US/docs/Web/JavaScript'
  when 'Statistics' then 'https://www.khanacademy.org/math/statistics-probability'
  when 'Machine Learning' then 'https://www.coursera.org/learn/machine-learning'
  when 'Data Visualization' then 'https://www.tableau.com/learn/training'
  else null
end
where rs.resource_url is null;