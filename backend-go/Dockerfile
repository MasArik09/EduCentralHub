# Step 1: Build the binary inside a Go builder container
FROM golang:alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the rest of the code
COPY . .

# Build a static binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main main.go

# Step 2: Run the binary in a clean minimal container
FROM alpine:latest  

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary and other needed files
COPY --from=builder /app/main .
COPY --from=builder /app/uploads ./uploads

EXPOSE 8080

CMD ["./main"]
