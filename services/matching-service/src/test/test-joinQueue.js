// test-match.js
import { io } from "socket.io-client";

const SOCKET_BASE_URL =
  process.env.MATCHING_GATEWAY_URL || "http://localhost:5001";
const SOCKET_PATH =
  process.env.MATCHING_GATEWAY_SOCKET_PATH || "/matching-socket";
const AUTH_TOKEN = process.env.MATCHING_AUTH_TOKEN;

const createClient = (userId, category, difficulty) => {
  const options = {
    path: SOCKET_PATH,
    transports: ["websocket"],
  };

  if (AUTH_TOKEN) {
    options.extraHeaders = {
      Authorization: `Bearer ${AUTH_TOKEN}`,
    };
  }

  const socket = io(SOCKET_BASE_URL, options);

  socket.on("connect", () => {
    console.log(`User ${userId} connected.`);
    // Send the join_queue event as soon as we connect
    socket.emit("join_queue", { userId, category, difficulty });
  });

  socket.on("match_found", (data) => {
    console.log(
      `✅ MATCH FOUND for ${userId}! Partner: ${data.partner}, Room: ${data.roomId}`,
    );
    socket.disconnect();
  });

  socket.on("match_timeout", (data) => {
    console.log(`❌ ${userId}: ${data.message}`);
    socket.disconnect();
  });

  socket.on("error", (data) => {
    console.log(`⚠️ ${userId} ERROR: ${data.message}`);
    socket.disconnect();
  });
};

// Simulate User A
createClient("User_A", "Algorithms", "Easy");

// Simulate User B after a 1-second delay
setTimeout(() => {
  createClient("User_B", "Data Structures", "Hard");
}, 1000);

// Simulate User C after a 2-second delay
// Should match with User A since they have the same category and difficulty
setTimeout(() => {
  createClient("User_C", "Algorithms", "Easy");
}, 2000);

// Simulate User D after a 3-second delay
setTimeout(() => {
  createClient("User_D", "Data Structures", "Hard");
}, 3000);

// Simulate User E after a 4-second delay
// Should return an error since there are no category and difficulty specified
setTimeout(() => {
  createClient("User_E", "", "");
}, 4000);

// Simulate User F after a 5-second delay
// Should return an error since it is using invalid category and difficulty specified
setTimeout(() => {
  createClient("User_F", "Invalid Category", "Invalid Difficulty");
}, 5000);
