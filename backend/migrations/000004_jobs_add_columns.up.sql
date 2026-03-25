-- Добавляем archive_id и type в таблицу jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS archive_id TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'preland';
