const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const collabRouter = require('./routes/collab');
const testCollabRouter = require('./routes/testCollab')

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());

app.use('/collab', collabRouter);

// for testing
app.use('/testCollab', testCollabRouter)

app.get('/', (req, res) => {
    res.send('Main PeerPrep Landing Page');
});

app.use(express.static(path.join(__dirname, 'frontend')));

// Global Socket Logic
io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        // Optional: Notify others that someone joined
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
                socket.to(room).emit('user-left', 'The other collaborator has left the workspace.');
            }
        });
    });
});

const PORT = 3000
server.listen(PORT, () => {
    console.log('Server running on http://localhost:3000');
});