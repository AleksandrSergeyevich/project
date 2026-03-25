package main

import (
	"database/sql"
	"log"
	"net/http"

	_ "github.com/lib/pq"

	"autotest/backend/internal/api/handler"
	"autotest/backend/internal/api/routes"
	"autotest/backend/internal/migrations"
	"autotest/backend/internal/queue/rabbitmq"
	"autotest/backend/internal/repository/postgres"
	"autotest/backend/internal/service"
	"autotest/backend/internal/utils"
)

func main() {
	// ======================
	// DB
	// ======================
	db, err := sql.Open("postgres", "postgres://testuser:testpass@db:5432/testresults?sslmode=disable")
	if err != nil {
		log.Fatal("db connect error:", err)
	}
	defer db.Close()

	utils.WaitForDB(db)

	// ======================
	// MIGRATIONS
	// ======================
	if err := migrations.Run(db, "./migrations"); err != nil {
		log.Fatal("migrations error:", err)
	}

	// ======================
	// RabbitMQ
	// ======================
	conn := utils.ConnectRabbitMQ("amqp://guest:guest@rabbitmq:5672/")
	defer conn.Close()

	q, err := rabbitmq.New(conn, "jobs")
	if err != nil {
		log.Fatal("rabbitmq init error:", err)
	}

	// ======================
	// DI (dependencies)
	// ======================

	// /repository
	repo := postgres.NewJobRepo(db)
	// /service
	svc := service.NewJobService(repo, q)
	// /api/handler
	h := handler.NewJobHandler(svc)

	// ======================
	// Routes
	// ======================
	router := routes.NewRouter(h)

	server := &http.Server{
		Addr:    ":8080",
		Handler: router,
	}

	log.Println("server started :8080")
	log.Fatal(server.ListenAndServe())
}
