CREATE TABLE IF NOT EXISTS test_runs (
    id           SERIAL PRIMARY KEY,
    archive_id   VARCHAR(255)  NOT NULL,
    started_at   TIMESTAMPTZ   NOT NULL,
    finished_at  TIMESTAMPTZ   NOT NULL,
    duration_ms  INT           NOT NULL DEFAULT 0,
    total_tests  INT           NOT NULL DEFAULT 0,
    passed       INT           NOT NULL DEFAULT 0,
    failed       INT           NOT NULL DEFAULT 0,
    pass_percent NUMERIC(5,2)  NOT NULL DEFAULT 0,
    status       VARCHAR(10)   NOT NULL CHECK (status IN ('PASSED', 'FAILED')),
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_suites (
    id          SERIAL PRIMARY KEY,
    run_id      INT          NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
    spec_file   VARCHAR(500) NOT NULL,
    title       TEXT         NOT NULL,
    duration_ms INT          NOT NULL DEFAULT 0,
    passed      INT          NOT NULL DEFAULT 0,
    failed      INT          NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS test_cases (
    id            SERIAL PRIMARY KEY,
    suite_id      INT         NOT NULL REFERENCES test_suites(id) ON DELETE CASCADE,
    title         TEXT        NOT NULL,
    state         VARCHAR(10) NOT NULL CHECK (state IN ('passed', 'failed', 'pending')),
    duration_ms   INT         NOT NULL DEFAULT 0,
    error_message TEXT        DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_test_runs_archive_id ON test_runs(archive_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_status     ON test_runs(status);
CREATE INDEX IF NOT EXISTS idx_test_suites_run_id   ON test_suites(run_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_suite_id  ON test_cases(suite_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_failed    ON test_cases(suite_id, state) WHERE state = 'failed';
