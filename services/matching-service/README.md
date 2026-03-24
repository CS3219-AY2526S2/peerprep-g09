# Matching Service

## Running Locally

To run the matching service locally, you can use the following command:

Run redis server (if you don't have it running already):

```bash
docker run -d --name my-redis -p 6379:6379 redis:alpine
```

Build the Docker image for the matching service:

```bash
docker build -t matching-service .
```

Run the Docker container for the matching service:

```bash
docker run -p 8082:8082 \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  matching-service
```

## Testing

To run the tests for the matching service, you can use the following command:

```bash
npm run test:match
```
