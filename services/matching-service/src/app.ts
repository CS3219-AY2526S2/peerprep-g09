import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);

// MIDDLEWARE SETUP
app.use(express.json());

// HTTP ROUTES
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "matching-service" });
});

// SOCKET.IO SETUP
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("join_queue", (data) => {
    // Add Redis logic here
    console.log(`User ${data.userId} joined the queue.`);
  });
});

// START THE SERVER
const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
