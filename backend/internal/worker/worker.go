package worker

import (
	"encoding/json"
	"log"

	"autotest/backend/internal/executor"
	"autotest/backend/internal/model"
	"autotest/backend/internal/queue"
	"autotest/backend/internal/repository"
)

type Worker struct {
	repo  repository.JobRepository
	queue queue.Queue
}

func NewWorker(repo repository.JobRepository, q queue.Queue) *Worker {
	return &Worker{
		repo:  repo,
		queue: q,
	}
}

type JobMessage struct {
	ID      string `json:"id"`
	Archive string `json:"archive"`
	Type    string `json:"type"`
}

func (w *Worker) Start() {
	log.Println("worker started...")

	w.queue.Consume(func(body []byte) error {
		var msg JobMessage

		if err := json.Unmarshal(body, &msg); err != nil {
			log.Println("invalid message:", err)
			return err
		}

		log.Println("processing job:", msg.ID)

		return w.processJob(msg)
	})
}

func (w *Worker) processJob(msg JobMessage) error {
	// 1. update status → running
	if err := w.repo.UpdateStatus(msg.ID, model.StatusRunning); err != nil {
		log.Println("❌ UpdateStatus error:", err)
		return err
	}

	// 2. unzip archive
	log.Println("📦 Unzipping archive:", msg.Archive)
	projectPath, err := executor.Unzip(msg.Archive)
	if err != nil {
		log.Println("❌ Unzip error:", err)
		_ = w.repo.SaveResult(msg.ID, []byte(err.Error()), model.StatusFailed)
		return err
	}
	log.Println("✅ Unzipped to:", projectPath)

	// 3. run web container (должен стартовать ДО cypress)
	log.Println("🌐 Starting web container for job:", msg.ID)
	webContainer, err := executor.RunWebContainer(msg.ID, projectPath)
	if err != nil {
		log.Println("❌ RunWebContainer error:", err)
		_ = w.repo.SaveResult(msg.ID, []byte(err.Error()), model.StatusFailed)
		return err
	}
	log.Println("✅ Web container started:", webContainer)

	// 4. run cypress (только после того как web поднялся)
	log.Println("🧪 Running Cypress for job:", msg.ID, "type:", msg.Type)
	output, cypressErr := executor.RunCypressContainer(msg.ID, msg.Type)
	if cypressErr != nil {
		log.Println("⚠️ Cypress error:", cypressErr)
	} else {
		log.Println("✅ Cypress finished successfully")
	}

	// 5. cleanup web container
	log.Println("🗑️ Stopping web container:", webContainer)
	_ = executor.StopContainer(webContainer)

	// 6. save result
	status := model.StatusDone
	if cypressErr != nil {
		status = model.StatusFailed
	}

	if err := w.repo.SaveResult(msg.ID, output, status); err != nil {
		log.Println("❌ SaveResult error:", err)
		return err
	}

	log.Println("✅ Job completed:", msg.ID, "status:", status)
	return nil
}
