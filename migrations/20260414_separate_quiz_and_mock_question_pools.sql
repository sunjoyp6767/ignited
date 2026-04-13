-- Separate question pools so normal quiz and mock exam can use different banks.
-- quiz pages use pool in ('quiz','both')
-- mock exam builder uses pool in ('mock','both')

alter table public.questions
  add column if not exists question_pool text;

update public.questions
set question_pool = coalesce(question_pool, 'quiz');

alter table public.questions
  alter column question_pool set default 'quiz';

alter table public.questions
  alter column question_pool set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'questions_question_pool_check'
  ) then
    alter table public.questions
      add constraint questions_question_pool_check
      check (question_pool in ('quiz', 'mock', 'both'));
  end if;
end $$;

comment on column public.questions.question_pool is
  'Defines where this MCQ is used: quiz, mock, or both.';

