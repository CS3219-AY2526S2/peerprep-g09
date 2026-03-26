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
    });
    socket.on('code-change', (data) => {
        socket.to(data.roomId).emit('receive-code', data.code);
    });
});

const PORT = 3000
server.listen(PORT, () => {
    console.log('Server running on http://localhost:3000');
});