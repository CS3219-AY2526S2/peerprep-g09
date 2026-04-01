# Gateway Service

This document explains how the **Frontend** or **External Clients** should interact with the Matching Service through the API Gateway (Port `5001`).

---

## Endpoints

| Service              | Internal URL (Local)    | Gateway Route   |
| :------------------- | :---------------------- | :-------------- |
| **User Service**     | `http://localhost:8080` | `/api/users`    |
| **Matching Service** | `http://localhost:8082` | `/api/matching` |

---

## Matching Service

| Type           | Gateway Entry Point                   | Internal Target (Docker)               |
| :------------- | :------------------------------------ | :------------------------------------- |
| **REST**       | `http://localhost:5001/api/matching`  | `http://matching-service:8082`         |
| **WebSockets** | `ws://localhost:5001/api/matching/ws` | `ws://matching-service:8082/socket.io` |

### 1. REST API

All requests sent to `/api/matching/**` are forwarded to the Matching Service.

- **Gateway URL:** `http://localhost:5001/api/matching`
- **Example Call:** `GET http://localhost:5001/api/matching/categories`

### 2. WebSocket (Socket.io)

- **Gateway Path:** `/matching-socket`

```javascript
// Client-side Socket.io connection example
import { io } from "socket.io-client";

const socket = io("http://localhost:5001", {
  path: "/matching-socket",
  transports: ["websocket"],
  auth: {
    token: "YOUR_JWT_TOKEN",
  },
});
```
