// plugins/db-reporter.js
const { Pool } = require('pg');
const { merge } = require('mochawesome-merge');
const fs = require('fs');
const path = require('path');

module.exports = (on, config) => {
  const pool = new Pool({
    host:     process.env.DB_HOST     || 'db',
    port:     parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME     || 'testresults',
    user:     process.env.DB_USER     || 'testuser',
    password: process.env.DB_PASSWORD || 'testpass',
  });

  // === ЗАДАЧА 1: Сохранение кастомных ошибок ===
  on('task', {
    async saveIssues(issues) {
      try {
        const archiveId = process.env.ARCHIVE_ID || 'unknown';
        const runResult = await pool.query(
          `SELECT id FROM test_runs WHERE archive_id = $1 ORDER BY id DESC LIMIT 1`,
          [archiveId]
        );
        if (runResult.rows.length === 0) {
          console.warn('⚠️ No test run found to attach issues');
          return null;
        }
        const runId = runResult.rows[0].id;
        for (const issue of issues) {
          await pool.query(
            `INSERT INTO test_cases (suite_id, title, state, error_message)
             VALUES ((SELECT id FROM test_suites WHERE run_id = $1 LIMIT 1), $2, 'failed', $3)`,
            [runId, issue.message, issue.message]
          );
        }
        console.log(`✅ Saved ${issues.length} issues`);
        return null;
      } catch (err) {
        console.error('❌ DB Error in saveIssues:', err.message);
        return null;
      }
    },
  });

  // === ЗАДАЧА 2: Мёрж JSON + запись в БД после всех тестов ===
  on('after:run', async (results) => {

    // ---------- Мёрж промежуточных JSON ----------
    let merged = null;
    try {
      const rawDir = path.resolve('cypress/results/.raw');
      const outDir = path.resolve('cypress/results');

      fs.mkdirSync(rawDir, { recursive: true });
      fs.mkdirSync(outDir, { recursive: true });

      const rawFiles = fs.readdirSync(rawDir)
        .filter((f) => f.endsWith('.json'))
        .map((f) => path.join(rawDir, f));

      if (rawFiles.length === 0) {
        console.warn('⚠️ No raw JSON files found to merge');
      } else {
        merged = await merge({ files: rawFiles });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outFile = path.join(outDir, `test-run_${timestamp}.json`);
        fs.writeFileSync(outFile, JSON.stringify(merged, null, 2), 'utf8');
        console.log(`✅ Merged report written → ${outFile}`);

        rawFiles.forEach((f) => fs.unlinkSync(f));
        console.log(`🗑️  Cleaned ${rawFiles.length} raw file(s)`);
      }
    } catch (err) {
      console.error('❌ Failed to merge reports:', err.message);
    }

    // ---------- Запись в БД ----------
    try {
      const archiveId = process.env.ARCHIVE_ID || 'unknown';
      const stats     = merged ? merged.stats : results;

      const startedAt    = stats.start     || new Date().toISOString();
      const finishedAt   = stats.end       || new Date().toISOString();
      const durationMs   = stats.duration  || 0;
      const totalTests   = stats.tests     || results.totalTests   || 0;
      const totalPassed  = stats.passes    || results.totalPassed  || 0;
      const totalFailed  = stats.failures  || results.totalFailed  || 0;
      const passPercent  = stats.passPercent
        ? parseFloat(stats.passPercent.toFixed(2))
        : (totalTests > 0 ? parseFloat(((totalPassed / totalTests) * 100).toFixed(2)) : 0);
      const status = totalFailed > 0 ? 'FAILED' : 'PASSED';

      // 1. Вставляем test_run
      const runRes = await pool.query(
        `INSERT INTO test_runs
           (archive_id, started_at, finished_at, duration_ms, total_tests, passed, failed, pass_percent, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [archiveId, startedAt, finishedAt, durationMs, totalTests, totalPassed, totalFailed, passPercent, status]
      );
      const runId = runRes.rows[0].id;
      console.log(`✅ test_runs inserted id=${runId}`);

      // 2. Вставляем test_suites + test_cases из merged JSON
      if (merged && merged.results) {
        for (const result of merged.results) {
          for (const suite of (result.suites || [])) {
            const specFile  = result.file  || '';
            const suiteTitle = suite.title || '';
            const suiteDur  = suite.duration || 0;
            const suitePassed = (suite.passes  || []).length;
            const suiteFailed = (suite.failures || []).length;

            const suiteRes = await pool.query(
              `INSERT INTO test_suites (run_id, spec_file, title, duration_ms, passed, failed)
               VALUES ($1, $2, $3, $4, $5, $6)
               RETURNING id`,
              [runId, specFile, suiteTitle, suiteDur, suitePassed, suiteFailed]
            );
            const suiteId = suiteRes.rows[0].id;

            for (const test of (suite.tests || [])) {
              const errMsg = test.fail && test.err ? (test.err.message || null) : null;
              await pool.query(
                `INSERT INTO test_cases (suite_id, title, state, duration_ms, error_message)
                 VALUES ($1, $2, $3, $4, $5)`,
                [suiteId, test.title, test.state, test.duration || 0, errMsg]
              );
            }
          }
        }
        console.log(`✅ test_suites + test_cases inserted for run id=${runId}`);
      }

    } catch (err) {
      console.error('❌ Failed to save to DB:', err.message);
    } finally {
      await pool.end();
    }
  });

  return config;
};
