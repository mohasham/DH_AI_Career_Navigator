-- =====================================================================
-- 007_seed_additional_skills_and_questions.sql
-- Adds 8 skills (React, TypeScript, HTML and CSS, Git, REST APIs, Docker,
-- Deep Learning, Data Cleaning), 5 questions each (2 easy, 2 medium,
-- 1 hard), and links them to careers via career_skills.
-- Safe to run more than once: every insert is guarded by NOT EXISTS.
-- Skill names appear in quiz URLs, so keep them to letters and spaces.
-- Question text avoids angle brackets, colons, double dashes and hash signs
-- because the Supabase SQL editor rejected the plain-statement version.
-- The questions run inside a DO block that reports which skill failed.
-- =====================================================================

-- 1. SKILLS
insert into skills (name)
select v.name
from (values
  ('React'), ('TypeScript'), ('HTML and CSS'), ('Git'),
  ('REST APIs'), ('Docker'), ('Deep Learning'), ('Data Cleaning')
) as v(name)
where not exists (select 1 from skills s where s.name = v.name);

-- 2. QUESTIONS (correct_answer must match one option exactly)
do $$
declare
  msg text := '';
  ctx text;
begin

  begin
    insert into questions (skill_id, question_text, options, correct_answer, difficulty)
    select s.id, v.q, v.o::jsonb, v.c, v.d
    from skills s,
    (values
      ('What is JSX in React?',
       '["A syntax extension that lets you write HTML-like markup inside JavaScript","A database query language","A CSS preprocessor","A package manager for React"]',
       'A syntax extension that lets you write HTML-like markup inside JavaScript', 'easy'),
      ('Which hook adds state to a function component?',
       '["useState","useRender","useStore","useProps"]', 'useState', 'easy'),
      ('What does the dependency array of useEffect control?',
       '["When the effect re-runs","The order in which components render","Which props a component accepts","How state is initialized"]',
       'When the effect re-runs', 'medium'),
      ('Why should each item in a rendered list have a unique key prop?',
       '["It helps React identify which items changed, were added, or were removed","It sets the CSS class of each item","It makes the list sortable by default","It stops the list from ever re-rendering"]',
       'It helps React identify which items changed, were added, or were removed', 'medium'),
      ('What can happen if you mutate a state array directly with push and then set the same array back as state?',
       '["React may not detect the change, so the UI might not re-render","React deep-compares the array and always re-renders","The array is copied automatically and everything works normally","The component is unmounted"]',
       'React may not detect the change, so the UI might not re-render', 'hard')
    ) as v(q, o, c, d)
    where s.name = 'React'
    and not exists (select 1 from questions x where x.skill_id = s.id and x.question_text = v.q);
  exception when others then
    get stacked diagnostics ctx = pg_exception_context;
    msg := msg || E'React: ' || sqlerrm || ' | ' || coalesce(ctx, '') || E'\n';
  end;

  begin
    insert into questions (skill_id, question_text, options, correct_answer, difficulty)
    select s.id, v.q, v.o::jsonb, v.c, v.d
    from skills s,
    (values
      ('What does TypeScript add to JavaScript?',
       '["Static type checking","A new browser engine","A database layer","Automatic CSS styling"]', 'Static type checking', 'easy'),
      ('Which keyword can describe the shape of an object type?',
       '["interface","struct","schema","shape"]', 'interface', 'easy'),
      ('What does a union type of string and number mean?',
       '["The value can be a string or a number","The value must be both a string and a number","A tuple of two values","A generic with two parameters"]',
       'The value can be a string or a number', 'medium'),
      ('How does the unknown type differ from any?',
       '["unknown forces you to narrow the type before using the value, while any turns checking off","They are identical","any is safer than unknown","unknown can only hold strings"]',
       'unknown forces you to narrow the type before using the value, while any turns checking off', 'medium'),
      ('What does the TypeScript utility type Partial do to an object type?',
       '["Makes every property optional","Makes every property read-only","Removes all properties","Converts the type into a string"]',
       'Makes every property optional', 'hard')
    ) as v(q, o, c, d)
    where s.name = 'TypeScript'
    and not exists (select 1 from questions x where x.skill_id = s.id and x.question_text = v.q);
  exception when others then
    get stacked diagnostics ctx = pg_exception_context;
    msg := msg || E'TypeScript: ' || sqlerrm || ' | ' || coalesce(ctx, '') || E'\n';
  end;

  begin
    insert into questions (skill_id, question_text, options, correct_answer, difficulty)
    select s.id, v.q, v.o::jsonb, v.c, v.d
    from skills s,
    (values
      ('Which HTML element creates a hyperlink?',
       '["The a element","The link element","The href element","The url element"]', 'The a element', 'easy'),
      ('Which CSS property changes the color of text?',
       '["color","font-style","text-align","visibility"]', 'color', 'easy'),
      ('Which display value lays out children in a flexible row or column?',
       '["flex","inline","table","none"]', 'flex', 'medium'),
      ('Which type of selector has the highest specificity?',
       '["An ID selector","A class selector","An element selector","The universal selector"]',
       'An ID selector', 'medium'),
      ('What does the CSS value sticky do for the position property?',
       '["The element behaves as relative until a scroll threshold, then sticks in place","The element is removed from the page layout","The element is always fixed to the viewport","The element can never be scrolled"]',
       'The element behaves as relative until a scroll threshold, then sticks in place', 'hard')
    ) as v(q, o, c, d)
    where s.name = 'HTML and CSS'
    and not exists (select 1 from questions x where x.skill_id = s.id and x.question_text = v.q);
  exception when others then
    get stacked diagnostics ctx = pg_exception_context;
    msg := msg || E'HTML and CSS: ' || sqlerrm || ' | ' || coalesce(ctx, '') || E'\n';
  end;

  begin
    insert into questions (skill_id, question_text, options, correct_answer, difficulty)
    select s.id, v.q, v.o::jsonb, v.c, v.d
    from skills s,
    (values
      ('Which command creates a local copy of a remote repository?',
       '["git clone","git commit","git stash","git rebase"]', 'git clone', 'easy'),
      ('What does git add do?',
       '["Stages changes to be included in the next commit","Uploads commits to the remote","Creates a new branch","Deletes untracked files"]',
       'Stages changes to be included in the next commit', 'easy'),
      ('Which command shows the commit history?',
       '["git log","git status","git remote","git config"]', 'git log', 'medium'),
      ('What is the main difference between git merge and git rebase?',
       '["Merge keeps history and adds a merge commit, rebase replays commits on top of another branch","Merge deletes the other branch, rebase keeps it","Rebase only works on remote branches","They are identical commands"]',
       'Merge keeps history and adds a merge commit, rebase replays commits on top of another branch', 'medium'),
      ('What does a hard reset to the previous commit do?',
       '["Moves the branch back one commit and discards changes in the working tree and index","Creates a new commit that undoes the last one","Deletes the remote branch","Stashes the last commit for later"]',
       'Moves the branch back one commit and discards changes in the working tree and index', 'hard')
    ) as v(q, o, c, d)
    where s.name = 'Git'
    and not exists (select 1 from questions x where x.skill_id = s.id and x.question_text = v.q);
  exception when others then
    get stacked diagnostics ctx = pg_exception_context;
    msg := msg || E'Git: ' || sqlerrm || ' | ' || coalesce(ctx, '') || E'\n';
  end;

  begin
    insert into questions (skill_id, question_text, options, correct_answer, difficulty)
    select s.id, v.q, v.o::jsonb, v.c, v.d
    from skills s,
    (values
      ('Which HTTP method is normally used to retrieve data without changing it?',
       '["GET","POST","DELETE","PUT"]', 'GET', 'easy'),
      ('What does the status code 404 mean?',
       '["The requested resource was not found","The server crashed","The request was successful","Authentication is required"]',
       'The requested resource was not found', 'easy'),
      ('Which status code indicates a resource was successfully created?',
       '["201","204","301","403"]', '201', 'medium'),
      ('What does it mean for a REST API to be stateless?',
       '["Each request carries everything needed, and the server keeps no client session between requests","The API never returns any data","The API has no database","The API only supports GET requests"]',
       'Each request carries everything needed, and the server keeps no client session between requests', 'medium'),
      ('What is the difference between status codes 401 and 403?',
       '["401 means not authenticated, 403 means authenticated but not allowed","401 means not found, 403 means server error","They are identical","401 is for redirects, 403 is for caching"]',
       '401 means not authenticated, 403 means authenticated but not allowed', 'hard')
    ) as v(q, o, c, d)
    where s.name = 'REST APIs'
    and not exists (select 1 from questions x where x.skill_id = s.id and x.question_text = v.q);
  exception when others then
    get stacked diagnostics ctx = pg_exception_context;
    msg := msg || E'REST APIs: ' || sqlerrm || ' | ' || coalesce(ctx, '') || E'\n';
  end;

  begin
    insert into questions (skill_id, question_text, options, correct_answer, difficulty)
    select s.id, v.q, v.o::jsonb, v.c, v.d
    from skills s,
    (values
      ('What is a Docker image?',
       '["A read-only template used to create containers","A running instance of an application","A text editor plugin","A cloud billing plan"]',
       'A read-only template used to create containers', 'easy'),
      ('Which file defines the steps to build a Docker image?',
       '["Dockerfile","docker.json","image.yaml","build.txt"]', 'Dockerfile', 'easy'),
      ('Which command lists running containers?',
       '["docker ps","docker images","docker build","docker pull"]', 'docker ps', 'medium'),
      ('In docker run, what does mapping host port 8080 to container port 80 do?',
       '["Traffic sent to port 8080 on the host reaches port 80 in the container","Sets the container memory to 8080 MB","Runs the container for 80 seconds","Creates 80 copies of the container"]',
       'Traffic sent to port 8080 on the host reaches port 80 in the container', 'medium'),
      ('What is the main purpose of a Docker volume?',
       '["Persist data beyond the life of a container","Limit the CPU a container can use","Encrypt the image layers","Rename the container"]',
       'Persist data beyond the life of a container', 'hard')
    ) as v(q, o, c, d)
    where s.name = 'Docker'
    and not exists (select 1 from questions x where x.skill_id = s.id and x.question_text = v.q);
  exception when others then
    get stacked diagnostics ctx = pg_exception_context;
    msg := msg || E'Docker: ' || sqlerrm || ' | ' || coalesce(ctx, '') || E'\n';
  end;

  begin
    insert into questions (skill_id, question_text, options, correct_answer, difficulty)
    select s.id, v.q, v.o::jsonb, v.c, v.d
    from skills s,
    (values
      ('What is an epoch in neural network training?',
       '["One full pass through the entire training dataset","A single weight update","The number of layers in the network","The value of the learning rate"]',
       'One full pass through the entire training dataset', 'easy'),
      ('Which algorithm computes the gradients used to update the weights of a neural network?',
       '["Backpropagation","Binary search","K-means","Quick sort"]', 'Backpropagation', 'easy'),
      ('What problem does dropout help reduce?',
       '["Overfitting","Underfitting","Missing values","Slow data loading"]', 'Overfitting', 'medium'),
      ('Which type of network is most commonly used for image data?',
       '["Convolutional neural network","Recurrent neural network","Linear regression","Decision tree"]',
       'Convolutional neural network', 'medium'),
      ('What is the vanishing gradient problem?',
       '["Gradients become extremely small in early layers, so they learn very slowly","Gradients become infinite and training crashes","The model memorizes the training data","The dataset runs out of labeled examples"]',
       'Gradients become extremely small in early layers, so they learn very slowly', 'hard')
    ) as v(q, o, c, d)
    where s.name = 'Deep Learning'
    and not exists (select 1 from questions x where x.skill_id = s.id and x.question_text = v.q);
  exception when others then
    get stacked diagnostics ctx = pg_exception_context;
    msg := msg || E'Deep Learning: ' || sqlerrm || ' | ' || coalesce(ctx, '') || E'\n';
  end;

  begin
    insert into questions (skill_id, question_text, options, correct_answer, difficulty)
    select s.id, v.q, v.o::jsonb, v.c, v.d
    from skills s,
    (values
      ('What is the purpose of data cleaning?',
       '["Fix or remove incorrect, duplicate, or incomplete data before analysis","Make a dataset larger","Encrypt the dataset","Convert all values to text"]',
       'Fix or remove incorrect, duplicate, or incomplete data before analysis', 'easy'),
      ('Which pandas method removes duplicate rows?',
       '["drop_duplicates","merge","groupby","pivot"]', 'drop_duplicates', 'easy'),
      ('Filling missing numeric values with the column mean is an example of what?',
       '["Imputation","Normalization","Encoding","Sampling"]', 'Imputation', 'medium'),
      ('Why should outliers be investigated before analysis?',
       '["They can distort averages and models","They always indicate correct data","They reduce file size","They are required by every database"]',
       'They can distort averages and models', 'medium'),
      ('Why should imputation or scaling statistics be computed on the training set only?',
       '["To avoid leaking information from the test set into training","To make the dataset smaller","Because test data cannot contain numbers","To speed up file loading"]',
       'To avoid leaking information from the test set into training', 'hard')
    ) as v(q, o, c, d)
    where s.name = 'Data Cleaning'
    and not exists (select 1 from questions x where x.skill_id = s.id and x.question_text = v.q);
  exception when others then
    get stacked diagnostics ctx = pg_exception_context;
    msg := msg || E'Data Cleaning: ' || sqlerrm || ' | ' || coalesce(ctx, '') || E'\n';
  end;

  if msg <> '' then
    raise exception 'FAILURES: %', msg;
  end if;
end $$;

-- 3. CAREER REQUIREMENTS (a row whose career title does not exist is skipped)
insert into career_skills (career_id, skill_id, required_level, importance)
select c.id, s.id, m.required_level, m.importance
from (values
  ('Full-Stack Developer','React',65,2), ('Full-Stack Developer','TypeScript',55,2),
  ('Full-Stack Developer','HTML and CSS',60,2), ('Backend Developer','Git',60,1),
  ('Full-Stack Developer','Git',60,1), ('Machine Learning Engineer','Git',50,1),
  ('Backend Developer','REST APIs',70,3), ('Full-Stack Developer','REST APIs',65,2),
  ('Backend Developer','Docker',50,2), ('Machine Learning Engineer','Docker',50,2),
  ('Machine Learning Engineer','Deep Learning',70,3), ('Data Scientist','Deep Learning',55,2),
  ('Data Analyst','Data Cleaning',70,3), ('Data Scientist','Data Cleaning',65,2),
  ('Business Intelligence Analyst','Data Cleaning',60,2)
) as m(career, skill, required_level, importance)
join careers c on c.title = m.career
join skills s on s.name = m.skill
where not exists (select 1 from career_skills cs where cs.career_id = c.id and cs.skill_id = s.id);

-- 4. VERIFY (run each query on its own)
-- Expect 8 rows, 5 questions each:
--   select s.name, count(*) from questions q join skills s on s.id = q.skill_id
--   where s.name in ('React','TypeScript','HTML and CSS','Git','REST APIs','Docker','Deep Learning','Data Cleaning')
--   group by s.name order by s.name;
-- Expect 0 rows (answer must match an option):
--   select q.id, q.question_text from questions q where not (q.options @> to_jsonb(q.correct_answer));
-- Expect 15 rows:
--   select c.title, s.name, cs.required_level, cs.importance from career_skills cs
--   join careers c on c.id = cs.career_id join skills s on s.id = cs.skill_id
--   where s.name in ('React','TypeScript','HTML and CSS','Git','REST APIs','Docker','Deep Learning','Data Cleaning')
--   order by s.name, c.title;