// internal/api/routes/routes.go
package routes

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"autotest/backend/internal/api/handler"
)

func NewRouter(h *handler.JobHandler) http.Handler {
	r := chi.NewRouter()

	r.Route("/jobs", func(r chi.Router) {
		r.Post("/", h.CreateJob)
		r.Get("/", h.ListJobs)
		r.Get("/{id}", h.GetJob)
		//добавить новый эндопинт для фильтрации джобов (тестов)
	})

	return r
}
