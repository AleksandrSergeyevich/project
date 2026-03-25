-- Добавляем 'skipped' в constraint state — Cypress иногда отдаёт этот статус
ALTER TABLE test_cases DROP CONSTRAINT IF EXISTS test_cases_state_check;
ALTER TABLE test_cases ADD CONSTRAINT test_cases_state_check
    CHECK (state IN ('passed', 'failed', 'pending', 'skipped'));
