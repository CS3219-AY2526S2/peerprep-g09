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

To run without Docker, make sure you have Node.js installed and Redis running locally. Then, you can start the service with:

```bash
npm install
npm run dev
```

Or build and run with:

```bash
npm install
npm run build
npm start
```

## Testing

To run the tests for the matching service, you can use the following command:

```bash
npm run test:match
```

## Linting

To run the linter for the matching service, you can use the following command:

```bash
npm run lint
```

Or to automatically fix linting issues:

```bash
npm run lint:fix
```

## Endpoints

The matching service is exposed on port `8082` and provides the following endpoints:

### REST Endpoints

| Method | Endpoint        | Description                            | Auth Required |
| :----- | :-------------- | :------------------------------------- | :------------ |
| `GET`  | `/categories`   | Return all predefined categories       | None          |
| `GET`  | `/difficulties` | Return all predefined difficulties     | None          |
| `GET`  | `/status`       | Return current matching status of user | UID           |

### WebSocket Endpoints

| Endpoint       | Description | Auth Required |
| :------------- | :---------- | :------------ |
| `/join_queue`  | Join queue  | UID           |
| `/leave_queue` | Leave queue | UID           |

## Functional Requirements Progress

|  Status  | ID                         | Feature                                                         | Priority | Sprint |
| :------: | :------------------------- | :-------------------------------------------------------------- | :------: | :----: |
| **M2F1** | **Queue Entry Validation** |                                                                 |          |        |
|   [x]    | M2F1.1.1                   | Maintain predefined supported topics and difficulties           |   High   |   1    |
|   [x]    | M2F1.1.2                   | Reject invalid topics or difficulty selections                  |   High   |   1    |
|   [x]    | M2F1.1.3                   | Reject queue requests with missing topics or difficulty         |   High   |   1    |
|   [ ]    | M2F1.1.4                   | Default to user's previous selection                            |   Low    |   3    |
| **M2F2** | **Queue Management**       |                                                                 |          |        |
|   [x]    | M2F2.1                     | Enqueue users into topic-specific matchmaking queues            |   High   |   1    |
|   [x]    | M2F2.2                     | Prevent duplicate queue entries                                 |   High   |   1    |
|   [x]    | M2F2.3                     | Remove users from queue upon WebSocket disconnect               |   High   |   1    |
| **M2F3** | **Matching Logic**         |                                                                 |          |        |
|   [x]    | M2F3.1                     | Prioritize matching users with the same topic                   |   High   |   1    |
|   [ ]    | M2F3.2                     | Match users with difficulty difference of at most 1 level       |  Medium  |   2    |
|   [ ]    | M2F3.3                     | Calculate estimated wait time using queue data                  |   Low    |   3    |
| **M2F4** | **Timeout Handling**       |                                                                 |          |        |
|   [x]    | M2F4.1                     | Detect unmatched users after 60 seconds                         |   High   |   1    |
|   [x]    | M2F4.2                     | Notify user on timeout                                          |   High   |   1    |
|   [ ]    | M2F4.3                     | Prompt user to retry or exit on timeout                         |  Medium  |   2    |
|   [ ]    | M2F4.3.1                   | Allow retry with same/wider filters or different topics         |  Medium  |   2    |
| **M2F5** | **Session Initialization** |                                                                 |          |        |
|   [x]    | M2F5.1                     | Atomically lock matched users (Prevention of Race Conditions)   |   High   |   1    |
|   [x]    | M2F5.2                     | Create session with `session_id`, `user_ids`, and `question_id` |   High   |   1    |
|   [ ]    | M2F5.2.1                   | Store session information into the database                     |  Medium  |   2    |
| **M2F6** | **Failure Recovery**       |                                                                 |          |        |
|   [ ]    | M2F6.1                     | Requeue user if disconnected during match finalization          |   High   |   1    |
|   [ ]    | M2F6.2                     | Prioritize requeued users in the matching logic                 |   High   |   1    |
