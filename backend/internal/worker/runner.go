package worker

import (
	"log"
)

type Runner struct {
	worker *Worker
}

func NewRunner(w *Worker) *Runner {
	return &Runner{worker: w}
}

func (r *Runner) Run() {
	log.Println("runner starting worker...")
	r.worker.Start()
}
