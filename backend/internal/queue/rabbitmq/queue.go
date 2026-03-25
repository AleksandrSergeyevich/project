package rabbitmq

import (
	amqp "github.com/rabbitmq/amqp091-go"
)

type RabbitMQ struct {
	ch    *amqp.Channel
	queue amqp.Queue
}

func New(conn *amqp.Connection, queueName string) (*RabbitMQ, error) {
	ch, err := conn.Channel()
	if err != nil {
		return nil, err
	}

	q, err := ch.QueueDeclare(
		queueName,
		true,  // durable
		false, // auto-delete
		false, // exclusive
		false, // no-wait
		nil,
	)
	if err != nil {
		return nil, err
	}

	return &RabbitMQ{
		ch:    ch,
		queue: q,
	}, nil
}

func (r *RabbitMQ) Publish(body []byte) error {
	return r.ch.Publish(
		"",
		r.queue.Name,
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)
}

func (r *RabbitMQ) Consume(handler func(body []byte) error) error {
	msgs, err := r.ch.Consume(
		r.queue.Name,
		"",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	go func() {
		for msg := range msgs {
			_ = handler(msg.Body)
		}
	}()

	return nil
}
