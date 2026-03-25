// internal/queue/queue.go
package queue

type Queue interface {
	Publish(body []byte) error
	Consume(handler func(body []byte) error) error
}
