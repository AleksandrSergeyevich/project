package main

import (
	"database/sql"
	"log"
	"os"
	"os/signal"
	"syscall"

	_ "github.com/lib/pq"

	"autotest/backend/internal/migrations"
	"autotest/backend/internal/queue/rabbitmq"
	"autotest/backend/internal/repository/postgres"
	"autotest/backend/internal/utils"
	"autotest/backend/internal/worker"
)

func main() {
	// DB
	db, err := sql.Open("postgres", "postgres://testuser:testpass@db:5432/testresults?sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	utils.WaitForDB(db)

	// Migrations
	if err := migrations.Run(db, "./migrations"); err != nil {
		log.Fatal("migrations error:", err)
	}

	// RabbitMQ
	conn := utils.ConnectRabbitMQ("amqp://guest:guest@rabbitmq:5672/")
	defer conn.Close()

	q, err := rabbitmq.New(conn, "jobs")
	if err != nil {
		log.Fatal(err)
	}

	// Repo
	repo := postgres.NewJobRepo(db)

	// Worker
	w := worker.NewWorker(repo, q)
	w.Start()

	// Блокируем main() — worker работает в горутине через Consume()
	// Завершаемся только по сигналу
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	sig := <-quit
	log.Println("worker shutting down, signal:", sig)
}
