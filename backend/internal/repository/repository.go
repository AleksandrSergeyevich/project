// internal/repository/repository.go
package repository

import "autotest/backend/internal/model"

type JobRepository interface {
	Create(job *model.Job) error
	GetByID(id string) (*model.Job, error)
	GetByIDWithResults(id string) (*model.JobWithResults, error)
	UpdateStatus(id string, status model.JobStatus) error
	SaveResult(id string, result []byte, status model.JobStatus) error
	List(filter *model.JobFilter) ([]model.Job, error)
}
