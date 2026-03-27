import express from 'express'
import path from 'path'
import http from 'http'
import {Server} from 'socket.io'
import {fileURLToPath} from 'url';

import collabRouter from './routes/collab.js'
import testCollabRouter from './routes/testCollab.js'

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());

app.use('/collab', collabRouter);

// for testing
app.use('/testCollab', testCollabRouter)

app.get('/', (req, res) => {
    res.send('Main PeerPrep Landing Page');
});

app.use(express.static(path.join(__dirname, 'frontend')));

const roomTimers = new Map()

// Global Socket Logic
io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => {
        socket.join(roomId);

        if (!roomTimers.has(roomId)) {
            const startTime = Date.now();
            const duration = 2 * 60 * 1000; 
            
            // Store the timeout reference so we know it's active
            const cleanupTask = setTimeout(() => {
                if (roomTimers.has(roomId)) {
                    roomTimers.delete(roomId);
                    // Physical proof of destruction in server console
                    console.log(`[RESOURCES RELEASED] Room ${roomId} destroyed. Memory cleared.`);
                    
                    // Tell any remaining users the room is officially dead
                    io.to(roomId).emit('room-destroyed');
                }
            }, duration + 5000);

            roomTimers.set(roomId, { startTime, duration, cleanupTask });
            console.log(`[RESOURCES ALLOCATED] Room ${roomId} created.`);
        }

        const roomData = roomTimers.get(roomId);
        const currentTime = Date.now();
        const elapsed = currentTime - roomData.startTime;
        const remaining = Math.max(0, roomData.duration - elapsed);

        socket.emit('timer-update', { 
            remaining, 
            // warning sent 1 minute before termination
            isWarning: remaining <= 60 * 1000 && remaining > 0 
        });

        updateUserCount(roomId);

        socket.to(roomId).emit('user-joined', 'A collaborator has entered.');
    });

    socket.on('code-change', (data) => {
        socket.to(data.roomId).emit('receive-code', data.code);
    });

    // Handle the moment right before the user leaves
    socket.on('disconnecting', () => {
        // socket.rooms is a Set containing the socket ID and the room IDs
        socket.rooms.forEach(room => {
            if (room !== socket.id) {
                setTimeout(() => updateUserCount(room), 100);
                socket.to(room).emit('user-left', 'The other collaborator has left the workspace.');
            }
        });
    });
});

// Helper to broadcast user count to a room
const updateUserCount = (roomId) => {
    const clients = io.sockets.adapter.rooms.get(roomId);
    const count = clients ? clients.size : 0;
    io.to(roomId).emit('user-count-update', count);
    console.log(`[Server] Room ${roomId} now has ${count} user(s).`);
};

const PORT = 3000
server.listen(PORT, () => {
    console.log('Server running on http://localhost:3000');
});