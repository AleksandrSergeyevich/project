package handler

import (
	"encoding/json"
	"io"
	"net/http"
	"os"

	"autotest/backend/internal/api/dto"
	"autotest/backend/internal/service"

	"github.com/google/uuid"
)

type JobHandler struct {
	service *service.JobService
}

func NewJobHandler(s *service.JobService) *JobHandler {
	return &JobHandler{service: s}
}

func (h *JobHandler) CreateJob(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 100<<20)

	if err := r.ParseMultipartForm(100 << 20); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "file is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	if err := os.MkdirAll("./uploads", 0755); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	testType := r.FormValue("type")
	if testType == "" {
		testType = "preland"
	}

	input := service.CreateJobInput{
		Author:   r.FormValue("author"),
		Name:     r.FormValue("name"),
		ResultID: r.FormValue("result_id"),
		Type:     testType,
	}

	fileName := uuid.NewString() + "_" + header.Filename
	filePath := "./uploads/" + fileName

	out, err := os.Create(filePath)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer out.Close()

	if _, err := io.Copy(out, file); err != nil {
		http.Error(w, "failed to save file", 500)
		return
	}

	input.ArchiveURL = filePath

	id, err := h.service.CreateJob(r.Context(), input)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"id": id})
}

// GetJob — детальный ответ по одному job с результатами тестов
func (h *JobHandler) GetJob(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")

	job, err := h.service.GetJobWithResults(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	suites := make([]dto.TestSuiteResult, 0, len(job.Results))
	for _, sr := range job.Results {
		suites = append(suites, dto.TestSuiteResult{
			SuiteID:      sr.SuiteID,
			SuiteTitle:   sr.SuiteTitle,
			State:        sr.State,
			ErrorMessage: sr.ErrorMessage,
		})
	}

	resp := dto.JobDetailResponse{
		ID:        job.ID,
		ArchiveID: job.ArchiveID,
		ResultID:  job.ResultID,
		Name:      job.Name,
		Author:    job.Author,
		State:     string(job.Status),
		Type:      job.Type,
		CreatedAt: job.CreatedAt.Format("2006-01-02T15:04:05Z"),
		Results:   suites,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// ListJobs — список всех jobs
func (h *JobHandler) ListJobs(w http.ResponseWriter, r *http.Request) {
	input := service.ListJobsInput{
		Author: r.URL.Query().Get("author"),
		Name:   r.URL.Query().Get("name"),
	}

	jobs, err := h.service.ListJobs(r.Context(), input)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	resp := make([]dto.JobResponse, 0, len(jobs))
	for _, j := range jobs {
		resp = append(resp, dto.JobResponse{
			ID:        j.ID,
			ArchiveID: j.ArchiveID,
			Author:    j.Author,
			Name:      j.Name,
			State:     string(j.Status),
			Type:      j.Type,
			CreatedAt: j.CreatedAt.Format("2006-01-02T15:04:05Z"),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
