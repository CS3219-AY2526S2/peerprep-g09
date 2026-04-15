import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import { verifyAdmin, verifyToken } from "./middleware/authMiddleware.js";

const app = express();
const USER_SERVICE = process.env.USER_SERVICE_URL || "http://localhost:8080";
const MATCHING_SERVICE =
  process.env.MATCHING_SERVICE_URL || "http://localhost:8082";
const QUESTION_SERVICE = process.env.QUESTION_SERVICE_URL || "http://localhost:8081";

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
  ["/api/users/update-password","/api/users/delete-account","/api/users/update-displayName","/api/users/oAuth-Login","/api/users/update-profilePic","/api/users/update-progress","/api/users/get-stats"],
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

// =============== Question Service ===============
// Public metadata endpoints (no auth required) - MUST BE FIRST
app.use(
  "/api/questions/metadata",
  createProxyMiddleware({
    target: QUESTION_SERVICE,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl,
  }),
);

// Admin-only endpoints (create, update, delete, seed)
app.use(
  ["/api/questions/seed", "/api/questions/editinfo"],
  verifyToken,
  verifyAdmin,
  createProxyMiddleware({
    target: QUESTION_SERVICE,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl,
  }),
);

// Authenticated user endpoints (list, get, random)
app.use(
  "/api/questions",
  verifyToken,
  createProxyMiddleware({
    target: QUESTION_SERVICE,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl,
  }),
);

app.listen(5001, () => console.log("Gateway running on PORT 5001"));

