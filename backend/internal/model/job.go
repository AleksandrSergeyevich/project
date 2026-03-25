package model

import "time"

type JobStatus string

const (
	StatusPending JobStatus = "pending"
	StatusRunning JobStatus = "running"
	StatusDone    JobStatus = "done"
	StatusFailed  JobStatus = "failed"
)

type Job struct {
	ID        string
	ArchiveID string    // archive_id — id архива из test_runs
	ResultID  string
	Author    string
	Name      string
	Type      string    // тип тестов: preland / offer / landoffer

	Status  JobStatus
	Payload []byte
	Result  []byte
	Error   *string

	CreatedAt time.Time
	UpdatedAt time.Time
}

type JobFilter struct {
	Author string
	Name   string
	Limit  int
	Offset int
}

// SuiteResult — результат одного test_case из test_suites
type SuiteResult struct {
	SuiteID      int
	SuiteTitle   string
	State        string
	ErrorMessage *string
}

// JobWithResults — Job с полными результатами тест-кейсов
type JobWithResults struct {
	ID        string
	ArchiveID string
	ResultID  string
	Name      string
	Author    string
	Type      string
	Status    JobStatus
	CreatedAt time.Time
	Results   []SuiteResult
}
