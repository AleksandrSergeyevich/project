package utils

import (
	"database/sql"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

func WaitForDB(db *sql.DB) {
	for i := 0; i < 10; i++ {
		err := db.Ping()
		if err == nil {
			log.Println("DB connected")
			return
		}

		log.Println("waiting for db...", err)
		time.Sleep(2 * time.Second)
	}

	log.Fatal("cannot connect to db")
}

func ConnectRabbitMQ(url string) *amqp.Connection {
	var conn *amqp.Connection
	var err error

	for i := 0; i < 10; i++ {
		conn, err = amqp.Dial(url)
		if err == nil {
			log.Println("RabbitMQ connected")
			return conn
		}

		log.Println("waiting for rabbitmq...", err)
		time.Sleep(2 * time.Second)
	}

	log.Fatal("cannot connect to rabbitmq")
	return nil
}
