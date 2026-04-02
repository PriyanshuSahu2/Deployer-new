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
		EmailRoutingKey,
		false,
		false,
		amqp.Publishing{
			ContentType:  "application/json",
			DeliveryMode: amqp.Persistent,
			Body:         body,
		},
	)
}

func (r *RabbitMQ) PublishDeployment(message interface{}) error {
	body, err := json.Marshal(message)
	if err != nil {
		return err
	}

	return r.Channel.Publish(
		DeploymentExchange,
		DeploymentRoutingKey,
		false,
		false,
		amqp.Publishing{
			ContentType:  "application/json",
			DeliveryMode: amqp.Persistent,
			Body:         body,
		},
	)
}
