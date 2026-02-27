package rabbitmq

const (
	EmailExchange = "email_exchange"
	EmailQueue    = "email_queue"
	RoutingKey    = "email.send"
)

func (r *RabbitMQ) DeclareTopology() error {

	err := r.Channel.ExchangeDeclare(
		EmailExchange,
		"direct",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	_, err = r.Channel.QueueDeclare(
		EmailQueue,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	return r.Channel.QueueBind(
		EmailQueue,
		RoutingKey,
		EmailExchange,
		false,
		nil,
	)
}
