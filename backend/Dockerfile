# Stage 1: Build phase
FROM golang:1.25-alpine AS builder

# Set the working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy dependency files first for layer caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the main API application
RUN CGO_ENABLED=0 GOOS=linux go build -v -o api-main main.go

# Build the worker application
RUN CGO_ENABLED=0 GOOS=linux go build -v -o worker-main cmd/worker/main.go

# Stage 2: Runtime phase
FROM alpine:latest

# Install runtime dependencies (e.g. certificates)
RUN apk add --no-cache ca-certificates

# Set the working directory
WORKDIR /app

# Copy both binaries from the builder stage
COPY --from=builder /app/api-main .
COPY --from=builder /app/worker-main .

# Expose the API port
EXPOSE 8080

# Default command (can be overridden in docker-compose)
CMD ["./api-main"]
