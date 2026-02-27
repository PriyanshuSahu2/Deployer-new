package rabbitmq

import (
	"encoding/json"

	amqp "github.com/rabbitmq/amqp091-go"
)

func (r *RabbitMQ) PublishEmail(message interface{}) error {
	body, err := json.Marshal(message)
	if err != nil {
		return err
	}

	return r.Channel.Publish(
		EmailExchange,
		RoutingKey,
		false,
		false,
		amqp.Publishing{
			ContentType:  "application/json",
			DeliveryMode: amqp.Persistent,
			Body:         body,
		},
	)
}
