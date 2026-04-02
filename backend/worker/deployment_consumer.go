package worker

import (
	"backend/rabbitmq"
	"backend/services"
	"encoding/json"
	"fmt"
	"log"
)

type DeploymentTask struct {
	ServiceUUID    string `json:"service_uuid"`
	WorkspaceUUID  string `json:"workspace_uuid"`
	DeploymentUUID string `json:"deployment_uuid"`
}

func StartDeploymentConsumer(rmq *rabbitmq.RabbitMQ, serviceService *services.ServiceService) error {
	err := rmq.Channel.Qos(
		1,     // prefetch count
		0,     // prefetch size
		false, // global
	)
	if err != nil {
		return err
	}

	msgs, err := rmq.Channel.Consume(
		rabbitmq.DeploymentQueue,
		"",    // consumer
		false, // auto-ack
		false, // exclusive
		false, // no-local
		false, // no-wait
		nil,   // args
	)
	if err != nil {
		return err
	}

	fmt.Println("🚀 Deployment consumer started")

	for msg := range msgs {
		var task DeploymentTask
		err := json.Unmarshal(msg.Body, &task)
		if err != nil {
			log.Println("❌ Failed to unmarshal deployment task:", err)
			msg.Nack(false, false)
			continue
		}

		log.Printf("📥 Processing deployment task for service %s\n", task.ServiceUUID)

		// Fetch service details for deployment
		serviceDetails, err := serviceService.GetServiceDetails(nil, task.ServiceUUID)
		if err != nil {
			log.Printf("❌ Failed to fetch service details for %s: %v\n", task.ServiceUUID, err)
			msg.Nack(false, false)
			continue
		}

		// Run the deployment logic (which already updates status to Deploying -> Success/Failed)
		s := serviceService.DeploymentService
		s.RunDeployment(serviceDetails, task.ServiceUUID, task.WorkspaceUUID, task.DeploymentUUID)

		msg.Ack(false)
		log.Printf("✅ Deployment task finished for service %s\n", task.ServiceUUID)
	}

	return nil
}
