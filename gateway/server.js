import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import { verifyAdmin, verifyToken } from "./middleware/authMiddleware.js";

const app = express();
const USER_SERVICE = "http://localhost:8080";
const MATCHING_SERVICE =
  process.env.MATCHING_SERVICE_URL || "http://localhost:8082";

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.use(
  ["/api/users/login", "/api/users/register", "/api/users/logout","/api/users/forgot-password"],
  createProxyMiddleware({
    target: USER_SERVICE,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl,
  }),
);
// Protected Route
app.use(
  ["/api/users/update-password","/api/users/delete-account"],
  verifyToken, 
  createProxyMiddleware({
    target: USER_SERVICE,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl,
  }),
);
// Protected Route (requiring admin access too)
app.use(
  ["/api/users/promote-user","/api/users/demote-self"],
  verifyToken,
  verifyAdmin,
  createProxyMiddleware({
    target: USER_SERVICE,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl,
  }),
);

// =============== Matching Service ===============
app.use(
  "/api/matching",
  createProxyMiddleware({
    target: MATCHING_SERVICE,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl,
  }),
);

// WebSocket for Socket.io
app.use(
  "/matching-socket",
  createProxyMiddleware({
    target: MATCHING_SERVICE,
    changeOrigin: true,
    ws: true,
    pathRewrite: { "^/matching-socket": "/socket.io" },
  }),
);

app.listen(5001, () => console.log("Gateway running on PORT 5001"));
