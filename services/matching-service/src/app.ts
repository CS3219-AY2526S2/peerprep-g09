import express from "express";
import cors from "cors";

import { createServer } from "http";
import { Server } from "socket.io";
import matchingRouter from "./routes/matching-routes.js";
import {
  handleDisconnect,
  handleJoinQueue,
  handleLeaveQueue,
} from "./controllers/socket-controller.js";
import { initializeMetadata } from "./controllers/rest-controller.js";

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 8082;

// MIDDLEWARE SETUP
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
// app.options("*", cors());

// To handle CORS errors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // "*" -> Allow all links to access

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );

  // Browsers usually send this before PUT or POST Requests
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, PATCH");
    return res.status(200).json({});
  }

  // Continue Route Processing
  next();
});

// HTTP ROUTES
app.use("/", matchingRouter);

app.get("/", (req, res, _) => {
  console.log("Sending Greetings!");
  res.json({
    message: "Hello World from matching-service",
  });
});

// SOCKET.IO SETUP
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("join_queue", (data) => {
    handleJoinQueue(io, socket, data);
  });

  socket.on("leave_queue", (data) => {
    handleLeaveQueue(socket, data.userId);
  });

  socket.on("disconnect", () => {
    // if disconnect, remove from redis queue
    handleDisconnect(socket);
  });
});

const startServer = async () => {
  await initializeMetadata();

  server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
};

startServer();
