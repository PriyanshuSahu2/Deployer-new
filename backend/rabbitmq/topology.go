package rabbitmq

const (
	EmailExchange      = "email_exchange"
	EmailQueue         = "email_queue"
	EmailRoutingKey    = "email.send"
	DeploymentExchange = "deployment_exchange"
	DeploymentQueue    = "deployment_queue"
	DeploymentRoutingKey = "deployment.run"
)

func (r *RabbitMQ) DeclareTopology() error {

	// Email Exchange & Queue
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

	err = r.Channel.QueueBind(
		EmailQueue,
		EmailRoutingKey,
		EmailExchange,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	// Deployment Exchange & Queue
	err = r.Channel.ExchangeDeclare(
		DeploymentExchange,
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
		DeploymentQueue,
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
		DeploymentQueue,
		DeploymentRoutingKey,
		DeploymentExchange,
		false,
		nil,
	)
}
