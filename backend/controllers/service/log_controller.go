package controller_service

import (
	redisclient "backend/redis"
	"backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type LogController struct {
	LogStreamer *services.LogStreamer
}

func NewLogController(logStreamer *services.LogStreamer) *LogController {
	return &LogController{LogStreamer: logStreamer}
}

func (c *LogController) StreamLogs(ctx *gin.Context) {
	serviceUUID := ctx.Param("serviceUUID")
	logType := ctx.Query("type") // "runtime" or "deployment"
	ticket := ctx.Query("ticket")

	if ticket == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication ticket required"})
		return
	}

	// Validate ticket against Redis
	userID, err := redisclient.Client.Get(redisclient.Ctx, "ws_ticket:"+ticket).Result()
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired ticket"})
		return
	}

	// Delete ticket immediately (one-time use)
	redisclient.Client.Del(redisclient.Ctx, "ws_ticket:"+ticket)

	// Set userID in context for logging/audit if needed
	ctx.Set("userID", userID)

	ws, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		return
	}
	defer ws.Close()

	if logType == "runtime" {
		c.LogStreamer.StreamRuntimeLogs(ctx.Request.Context(), ws, serviceUUID)
	} else {
		c.LogStreamer.StreamDeploymentLogs(ctx.Request.Context(), ws, serviceUUID)
	}
}
