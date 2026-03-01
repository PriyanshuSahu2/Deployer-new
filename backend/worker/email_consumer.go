package worker

import (
	"backend/rabbitmq"
	"backend/services"
	"encoding/json"
	"fmt"
	"log"
)

type EmailMessage struct {
	Type     string `json:"type"`
	To       string `json:"to"`
	Subject  string `json:"subject"`
	HtmlBody string `json:"htmlBody"`
}

func StartEmailConsumer(rmq *rabbitmq.RabbitMQ, emailService *services.EmailService) error {
	err := rmq.Channel.Qos(
		1,
		0,
		false,
	)

	if err != nil {
		return err
	}
	msgs, err := rmq.Channel.Consume(
		rabbitmq.EmailQueue,
		"",
		false,
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		return err
	}

	fmt.Println("Email consumer staretd")

	for msg := range msgs {
		var emailMsg EmailMessage

		err := json.Unmarshal(msg.Body, &emailMsg)

		if err != nil {
			log.Println("Failed to unmarshel message", err)
			msg.Nack(false, false)

			continue
		}

		err = emailService.SendEmail(
			emailMsg.To,
			emailMsg.Subject,
			emailMsg.HtmlBody,
		)

		if err != nil {
			log.Println("Failed to send email:", err)
			msg.Nack(false, true)
			continue
		}

		msg.Ack(false)
		log.Println("✅ Email sent successfully:", emailMsg.To)
	}

	return nil
}
