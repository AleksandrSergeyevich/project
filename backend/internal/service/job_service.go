// internal/service/job_service.go
package service

import (
	"context"
	"encoding/json"

	"github.com/google/uuid"

	"autotest/backend/internal/model"
	"autotest/backend/internal/queue"
	"autotest/backend/internal/repository"
)

type JobService struct {
	repo  repository.JobRepository
	queue queue.Queue
}

type ListJobsInput struct {
	Author string
	Name   string
	Limit  int
	Offset int
}

// JobMessage — то что уходит в RabbitMQ
type JobMessage struct {
	ID      string `json:"id"`
	Archive string `json:"archive"`
	Type    string `json:"type"`
}

func NewJobService(r repository.JobRepository, q queue.Queue) *JobService {
	return &JobService{repo: r, queue: q}
}

type CreateJobInput struct {
	ArchiveURL string
	Author     string
	Name       string
	ResultID   string
	Type       string // тип тестов: preland / offer / landoffer
}

func (s *JobService) CreateJob(ctx context.Context, input CreateJobInput) (string, error) {
	id := uuid.NewString()

	payload, _ := json.Marshal(input)

	job := &model.Job{
		ID:        id,
		ArchiveID: id,   // archive_id = id самого job
		Status:    model.StatusPending,
		Payload:   payload,
		Author:    input.Author,
		Name:      input.Name,
		ResultID:  input.ResultID,
		Type:      input.Type,
	}

	if err := s.repo.Create(job); err != nil {
		return "", err
	}

	msg := JobMessage{
		ID:      id,
		Archive: input.ArchiveURL,
		Type:    input.Type,
	}

	msgBytes, err := json.Marshal(msg)
	if err != nil {
		return "", err
	}

	if err := s.queue.Publish(msgBytes); err != nil {
		return "", err
	}

	return id, nil
}

func (s *JobService) GetJob(ctx context.Context, id string) (*model.Job, error) {
	return s.repo.GetByID(id)
}

func (s *JobService) GetJobWithResults(ctx context.Context, id string) (*model.JobWithResults, error) {
	return s.repo.GetByIDWithResults(id)
}

func (s *JobService) ListJobs(ctx context.Context, input ListJobsInput) ([]model.Job, error) {
	filter := &model.JobFilter{
		Author: input.Author,
		Name:   input.Name,
		Limit:  input.Limit,
		Offset: input.Offset,
	}

	if filter.Limit == 0 {
		filter.Limit = 50
	}

	return s.repo.List(filter)
}
