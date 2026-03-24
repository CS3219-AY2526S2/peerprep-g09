// test-match.js
import { io } from "socket.io-client";

const createClient = (userId, category, difficulty) => {
  const socket = io("http://localhost:8082");

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
};

// Simulate User A
createClient("User_A", "Algorithms", "Easy");

// Simulate User B after a 1-second delay
setTimeout(() => {
  createClient("User_B", "Data Structures", "Difficult");
}, 1000);

// Simulate User C after a 2-second delay
// Should match with User A since they have the same category and difficulty
setTimeout(() => {
  createClient("User_C", "Algorithms", "Easy");
}, 2000);

// Simulate User D after a 3-second delay
setTimeout(() => {
  createClient("User_D", "Data Structures", "Difficult");
}, 3000);

// Simulate User E after a 4-second delay
// Should timeout within 5 seconds since no match will be found
setTimeout(() => {
  createClient("User_E", "Algorithms", "Medium");
}, 4000);
