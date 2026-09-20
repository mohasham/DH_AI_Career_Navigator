-- ============================================================
-- Seed: Skills + Questions
-- Migration 002 — populates the question bank for Sprint 3's
-- skill assessment engine.
--
-- Scope: 6 core skills matching the example careers used
-- throughout the BRD/wireframes (Data Analyst, AI Engineer,
-- Full-Stack Developer), 5 questions per skill, mixed difficulty.
-- This is intentionally a focused set, not an exhaustive bank —
-- enough to make assessment and matching meaningfully demoable.
-- ============================================================

-- ------------------------------------------------------------
-- SKILLS
-- ------------------------------------------------------------
insert into skills (name, category, description) values
  ('Python', 'Programming', 'General-purpose programming language used in data, backend, and AI work.'),
  ('SQL', 'Data', 'Query language for relational databases.'),
  ('JavaScript', 'Programming', 'Core language of the web, used in frontend and backend development.'),
  ('Statistics', 'Analytics', 'Foundational mathematical concepts for data analysis and machine learning.'),
  ('Machine Learning', 'AI', 'Techniques for building models that learn patterns from data.'),
  ('Data Visualization', 'Data', 'Presenting data clearly through charts, dashboards, and graphics.');

-- ------------------------------------------------------------
-- QUESTIONS — Python
-- ------------------------------------------------------------
insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What does this code output? print(type([]))', 
  '["<class ''list''>", "<class ''dict''>", "<class ''tuple''>", "<class ''set''>"]'::jsonb,
  '<class ''list''>', 'easy'
from skills where name = 'Python';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'Which keyword is used to define a function in Python?',
  '["func", "def", "function", "lambda"]'::jsonb,
  'def', 'easy'
from skills where name = 'Python';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What does x = [i * 2 for i in range(3)] produce?',
  '["[0, 2, 4]", "[1, 2, 3]", "[2, 4, 6]", "Error"]'::jsonb,
  '[0, 2, 4]', 'medium'
from skills where name = 'Python';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What is the output of 3 // 2 in Python?',
  '["1.5", "1", "2", "Error"]'::jsonb,
  '1', 'medium'
from skills where name = 'Python';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What does the "self" parameter refer to inside a class method?',
  '["The class itself", "The current instance of the class", "A global variable", "Nothing, it is optional"]'::jsonb,
  'The current instance of the class', 'hard'
from skills where name = 'Python';

-- ------------------------------------------------------------
-- QUESTIONS — SQL
-- ------------------------------------------------------------
insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'Which SQL keyword is used to filter rows?',
  '["SELECT", "WHERE", "ORDER BY", "GROUP BY"]'::jsonb,
  'WHERE', 'easy'
from skills where name = 'SQL';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'Which clause is used to sort query results?',
  '["SORT BY", "ORDER BY", "GROUP BY", "FILTER BY"]'::jsonb,
  'ORDER BY', 'easy'
from skills where name = 'SQL';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What does a JOIN do in SQL?',
  '["Deletes rows", "Combines rows from two or more tables", "Creates a new table", "Sorts a table"]'::jsonb,
  'Combines rows from two or more tables', 'medium'
from skills where name = 'SQL';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'Which clause is used with aggregate functions to group rows sharing a value?',
  '["WHERE", "GROUP BY", "HAVING", "ORDER BY"]'::jsonb,
  'GROUP BY', 'medium'
from skills where name = 'SQL';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What is the difference between WHERE and HAVING?',
  '["No difference", "WHERE filters rows before grouping, HAVING filters after grouping", "HAVING is used for joins only", "WHERE only works with numbers"]'::jsonb,
  'WHERE filters rows before grouping, HAVING filters after grouping', 'hard'
from skills where name = 'SQL';

-- ------------------------------------------------------------
-- QUESTIONS — JavaScript
-- ------------------------------------------------------------
insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'Which keyword declares a variable that cannot be reassigned?',
  '["var", "let", "const", "static"]'::jsonb,
  'const', 'easy'
from skills where name = 'JavaScript';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What does typeof [] return?',
  '["array", "object", "list", "undefined"]'::jsonb,
  'object', 'medium'
from skills where name = 'JavaScript';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What does the .map() array method return?',
  '["The same array, modified in place", "A new array with the results of calling a function on every element", "A single value", "Nothing"]'::jsonb,
  'A new array with the results of calling a function on every element', 'medium'
from skills where name = 'JavaScript';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What is a Promise in JavaScript?',
  '["A type of loop", "An object representing eventual completion of an async operation", "A variable type", "A CSS property"]'::jsonb,
  'An object representing eventual completion of an async operation', 'hard'
from skills where name = 'JavaScript';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What does "this" refer to inside a regular JavaScript function (not an arrow function)?',
  '["Always the global object", "Depends on how the function is called", "Always undefined", "The function itself"]'::jsonb,
  'Depends on how the function is called', 'hard'
from skills where name = 'JavaScript';

-- ------------------------------------------------------------
-- QUESTIONS — Statistics
-- ------------------------------------------------------------
insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What does "mean" refer to in statistics?',
  '["The middle value", "The most frequent value", "The average value", "The range"]'::jsonb,
  'The average value', 'easy'
from skills where name = 'Statistics';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What is the median of [1, 3, 3, 6, 7, 8, 9]?',
  '["3", "6", "7", "5.28"]'::jsonb,
  '6', 'easy'
from skills where name = 'Statistics';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What does standard deviation measure?',
  '["The average value", "The spread of data around the mean", "The most common value", "The total sum"]'::jsonb,
  'The spread of data around the mean', 'medium'
from skills where name = 'Statistics';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What is a p-value used for?',
  '["Measuring the mean", "Testing statistical significance", "Calculating variance", "Sorting data"]'::jsonb,
  'Testing statistical significance', 'hard'
from skills where name = 'Statistics';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What does a normal distribution look like?',
  '["Flat and uniform", "A symmetric bell curve", "Always skewed right", "A straight line"]'::jsonb,
  'A symmetric bell curve', 'medium'
from skills where name = 'Statistics';

-- ------------------------------------------------------------
-- QUESTIONS — Machine Learning
-- ------------------------------------------------------------
insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What is supervised learning?',
  '["Learning without any labeled data", "Learning from labeled input-output pairs", "A type of database", "A visualization technique"]'::jsonb,
  'Learning from labeled input-output pairs', 'easy'
from skills where name = 'Machine Learning';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What is overfitting?',
  '["A model that performs well on new data", "A model that memorizes training data but fails to generalize", "A model with too few parameters", "A fast training process"]'::jsonb,
  'A model that memorizes training data but fails to generalize', 'medium'
from skills where name = 'Machine Learning';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'Which of these is an unsupervised learning technique?',
  '["Linear regression", "K-means clustering", "Logistic regression", "Decision trees for classification"]'::jsonb,
  'K-means clustering', 'medium'
from skills where name = 'Machine Learning';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What is the purpose of a train/test split?',
  '["To make training faster", "To evaluate how well a model generalizes to unseen data", "To reduce the number of features", "To visualize the data"]'::jsonb,
  'To evaluate how well a model generalizes to unseen data', 'medium'
from skills where name = 'Machine Learning';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What does a confusion matrix show?',
  '["Model training speed", "The correctness of classification predictions across classes", "Feature importance", "Data distribution"]'::jsonb,
  'The correctness of classification predictions across classes', 'hard'
from skills where name = 'Machine Learning';

-- ------------------------------------------------------------
-- QUESTIONS — Data Visualization
-- ------------------------------------------------------------
insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'Which chart type is best for showing change over time?',
  '["Pie chart", "Line chart", "Scatter plot", "Heatmap"]'::jsonb,
  'Line chart', 'easy'
from skills where name = 'Data Visualization';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'Which chart type is best for comparing categories?',
  '["Line chart", "Bar chart", "Histogram", "Scatter plot"]'::jsonb,
  'Bar chart', 'easy'
from skills where name = 'Data Visualization';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What does a scatter plot help identify?',
  '["Trends over time only", "Relationships or correlations between two variables", "Category proportions", "Total sums"]'::jsonb,
  'Relationships or correlations between two variables', 'medium'
from skills where name = 'Data Visualization';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'Why might a pie chart be a poor choice for many categories?',
  '["Pie charts cannot use colors", "Small slices become hard to compare accurately", "Pie charts only work with two categories", "Pie charts cannot show percentages"]'::jsonb,
  'Small slices become hard to compare accurately', 'medium'
from skills where name = 'Data Visualization';

insert into questions (skill_id, question_text, options, correct_answer, difficulty)
select id, 'What is a common risk of a poorly scaled chart axis?',
  '["It always crashes the browser", "It can visually mislead viewers about the actual data trend", "It makes charts load faster", "There is no risk"]'::jsonb,
  'It can visually mislead viewers about the actual data trend', 'hard'
from skills where name = 'Data Visualization';