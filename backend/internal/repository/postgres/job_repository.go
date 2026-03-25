package postgres

import (
	"autotest/backend/internal/model"
	"database/sql"
	"fmt"
	"time"
)

type JobRepo struct {
	db *sql.DB
}

func NewJobRepo(db *sql.DB) *JobRepo {
	return &JobRepo{db: db}
}

func (r *JobRepo) Create(job *model.Job) error {
	_, err := r.db.Exec(`
		INSERT INTO jobs (id, archive_id, result_id, author, name, status, type, payload, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
	`,
		job.ID,
		job.ArchiveID,
		job.ResultID,
		job.Author,
		job.Name,
		job.Status,
		job.Type,
		job.Payload,
	)
	return err
}

func (r *JobRepo) GetByID(id string) (*model.Job, error) {
	row := r.db.QueryRow(`
		SELECT id, status, payload, result, error
		FROM jobs WHERE id = $1
	`, id)

	var job model.Job
	err := row.Scan(&job.ID, &job.Status, &job.Payload, &job.Result, &job.Error)
	return &job, err
}

func (r *JobRepo) List(filter *model.JobFilter) ([]model.Job, error) {
	query := `
	SELECT id, archive_id, name, author, status, type, created_at
	FROM jobs
	WHERE 1=1
	`

	args := []interface{}{}
	i := 1

	if filter.Author != "" {
		query += fmt.Sprintf(" AND author = $%d", i)
		args = append(args, filter.Author)
		i++
	}

	if filter.Name != "" {
		query += fmt.Sprintf(" AND name ILIKE $%d", i)
		args = append(args, "%"+filter.Name+"%")
		i++
	}

	query += " ORDER BY created_at DESC"

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []model.Job

	for rows.Next() {
		var j model.Job
		if err := rows.Scan(&j.ID, &j.ArchiveID, &j.Name, &j.Author, &j.Status, &j.Type, &j.CreatedAt); err != nil {
			return nil, err
		}
		jobs = append(jobs, j)
	}

	return jobs, nil
}

func (r *JobRepo) UpdateStatus(id string, status model.JobStatus) error {
	_, err := r.db.Exec(`
		UPDATE jobs
		SET status = $1,
		    updated_at = NOW()
		WHERE id = $2
	`, status, id)
	return err
}

func (r *JobRepo) SaveResult(id string, result []byte, status model.JobStatus) error {
	_, err := r.db.Exec(`
		UPDATE jobs
		SET result = $1,
		    status = $2,
		    updated_at = NOW()
		WHERE id = $3
	`, result, status, id)
	return err
}

// GetByIDWithResults возвращает job + все test_cases из связанных test_runs/test_suites
func (r *JobRepo) GetByIDWithResults(id string) (*model.JobWithResults, error) {
	row := r.db.QueryRow(`
		SELECT id, archive_id, result_id, name, author, status, type, created_at
		FROM jobs WHERE id = $1
	`, id)

	var j model.JobWithResults
	var createdAt time.Time
	if err := row.Scan(&j.ID, &j.ArchiveID, &j.ResultID, &j.Name, &j.Author, &j.Status, &j.Type, &createdAt); err != nil {
		return nil, err
	}
	j.CreatedAt = createdAt

	rows, err := r.db.Query(`
		SELECT
			tc.suite_id,
			ts.title   AS suite_title,
			tc.state,
			tc.error_message
		FROM test_runs    tr
		JOIN test_suites  ts ON ts.run_id   = tr.id
		JOIN test_cases   tc ON tc.suite_id = ts.id
		WHERE tr.archive_id = $1
		ORDER BY tc.id
	`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var sr model.SuiteResult
		if err := rows.Scan(&sr.SuiteID, &sr.SuiteTitle, &sr.State, &sr.ErrorMessage); err != nil {
			return nil, err
		}
		j.Results = append(j.Results, sr)
	}

	return &j, nil
}
