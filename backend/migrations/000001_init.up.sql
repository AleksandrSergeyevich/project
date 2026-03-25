CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    result_id TEXT,
    author TEXT NOT NULL,
    name TEXT NOT NULL,

    status TEXT NOT NULL,
    payload BYTEA,
    result BYTEA,
    error TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_author ON jobs(author);
CREATE INDEX IF NOT EXISTS idx_jobs_name ON jobs(name);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);