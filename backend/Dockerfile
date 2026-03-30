# Stage 1: Build phase
FROM golang:1.22-alpine AS builder

# Set the working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy dependency files first for layer caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the main application
RUN CGO_ENABLED=0 GOOS=linux go build -o main main.go

# Stage 2: Runtime phase
FROM alpine:latest

# Install runtime dependencies (e.g. certificates)
RUN apk add --no-cache ca-certificates

# Set the working directory
WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/main .

# Expose the API port
EXPOSE 8080

# Environment-based entry command
CMD ["./main"]
