import "dotenv/config";
import express from 'express';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';

import collabRouter from './routes/collab.js';
import internalRouter from './routes/internal.js';
import {
    attachQuestion,
    endSession,
    getRemainingMs,
    getSession,
    markSessionNotified,
    removeSession,
    startSession,
} from './sessionStore.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QUESTION_SERVICE_URL =
    process.env.QUESTION_SERVICE_URL || "http://question-service:8081";
const USER_SERVICE_URL =
    process.env.USER_SERVICE_URL || "http://user-service:8080";
const ROOM_IDLE_GRACE_MS = Number(
    process.env.SESSION_DISCONNECT_GRACE_MS || 15 * 1000
);
const SESSION_DESTROY_DELAY_MS = 500;

const sessionTimers = new Map();
const idleTimers = new Map();

app.use(express.json());

app.use('/internal', internalRouter);
app.use('/collab', collabRouter);

app.get('/', (req, res) => {
    res.send('Main PeerPrep Landing Page');
});

app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/config', express.static(path.join(__dirname, 'config')));

const fetchQuestionById = async (questionId) => {
    if (!questionId) {
        return null;
    }

    const response = await fetch(`${QUESTION_SERVICE_URL}/api/questions/internal/${questionId}`, {
        headers: {
            "x-internal-service-key": process.env.INTERNAL_SERVICE_KEY || "",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch question ${questionId}: ${response.status}`);
    }

    return response.json();
};

const getConnectedClientCount = (roomId) => {
    const clients = io.sockets.adapter.rooms.get(roomId);
    return clients ? clients.size : 0;
};

const updateUserCount = (roomId) => {
    const count = getConnectedClientCount(roomId);
    io.to(roomId).emit('user-count-update', count);
    console.log(`[Server] Room ${roomId} now has ${count} user(s).`);
    return count;
};

const clearTimer = (timerMap, roomId) => {
    const timer = timerMap.get(roomId);
    if (timer) {
        clearTimeout(timer);
        timerMap.delete(roomId);
    }
};

const notifyUserService = async (session) => {
    if (!session?.questionId || session.notifiedAt) {
        if (!session?.questionId) {
            console.warn(`[SESSION SYNC SKIPPED] Room ${session?.sessionId || 'unknown'} has no questionId.`);
        }
        return;
    }

    const questionDifficulty =
        session.question?.difficulty || session.difficulty || "Unknown";
    const questionTopics = Array.isArray(session.question?.topics)
        ? session.question.topics
        : session.topic
            ? [session.topic]
            : [];

    await Promise.all(
        session.participants.map(async (uid) => {
            const response = await fetch(`${USER_SERVICE_URL}/api/users/internal/update-progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-internal-service-key': process.env.INTERNAL_SERVICE_KEY || "",
                },
                body: JSON.stringify({
                    uid,
                    questionId: session.questionId,
                    questionDifficulty,
                    questionTopics,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Failed to update progress for ${uid}: ${response.status} ${errorText}`,
                );
            }
        }),
    );

    markSessionNotified(session.sessionId);
    console.log(
        `[SESSION SYNC OK] Room ${session.sessionId}: updated progress for ${session.participants.join(', ')}.`,
    );
};

const finalizeSession = async (roomId, reason = 'completed') => {
    clearTimer(sessionTimers, roomId);
    clearTimer(idleTimers, roomId);

    const { session } = endSession(roomId, reason);
    if (!session) {
        return;
    }

    console.log(`[SESSION FINALIZED] Room ${roomId}: reason=${reason}`);

    try {
        if (!session.notifiedAt) {
            await notifyUserService(session);
        }
    } catch (error) {
        console.error(`[SESSION SYNC FAILED] Room ${roomId}:`, error.message);
        io.to(roomId).emit('session-sync-error', {
            message: 'Session ended, but progress sync failed.',
        });
        return;
    }

    io.to(roomId).emit('room-destroyed');
    setTimeout(() => removeSession(roomId), SESSION_DESTROY_DELAY_MS);
};

const scheduleSessionExpiry = (roomId) => {
    clearTimer(sessionTimers, roomId);

    const remainingMs = getRemainingMs(roomId);
    const timer = setTimeout(() => {
        sessionTimers.delete(roomId);
        void finalizeSession(roomId, 'timeout');
    }, Math.max(remainingMs, 0) + 250);

    sessionTimers.set(roomId, timer);
};

const scheduleIdleCleanup = (roomId) => {
    clearTimer(idleTimers, roomId);

    const timer = setTimeout(() => {
        idleTimers.delete(roomId);
        if (getConnectedClientCount(roomId) === 0) {
            void finalizeSession(roomId, 'ended');
        }
    }, ROOM_IDLE_GRACE_MS);

    idleTimers.set(roomId, timer);
};

io.on('connection', (socket) => {
    socket.on('join-room', async (payloadOrRoomId) => {
        const roomId =
            typeof payloadOrRoomId === 'object' && payloadOrRoomId !== null
                ? String(payloadOrRoomId.roomId || payloadOrRoomId.sessionId || "").trim()
                : String(payloadOrRoomId || "").trim();

        if (!roomId) {
            socket.emit('session-error', { message: 'Room ID is required.' });
            return;
        }

        let session = getSession(roomId);
        if (!session) {
            socket.emit('session-error', { message: 'Session not found.' });
            return;
        }

        socket.join(roomId);
        clearTimer(idleTimers, roomId);

        session = startSession(roomId);

        if (!session.question && session.questionId) {
            try {
                const question = await fetchQuestionById(session.questionId);
                session = attachQuestion(roomId, question);
            } catch (error) {
                console.error(`[QUESTION FETCH FAILED] Room ${roomId}:`, error.message);
            }
        }

        scheduleSessionExpiry(roomId);

        socket.emit('init-room-data', {
            roomId,
            questionId: session?.questionId || null,
            question: session?.question || null,
            participants: session?.participants || [],
        });

        socket.emit('timer-update', {
            remaining: getRemainingMs(roomId),
            isWarning: getRemainingMs(roomId) <= 60 * 1000,
        });

        updateUserCount(roomId);
        socket.to(roomId).emit('user-joined', 'A collaborator has entered.');
    });

    socket.on('code-change', (data) => {
        if (!data?.roomId) {
            return;
        }

        socket.to(data.roomId).emit('receive-code', data.code);
    });

    socket.on('leave-room', (roomId) => {
        if (!roomId) {
            return;
        }

        socket.leave(roomId);
        socket.to(roomId).emit('user-left', 'The other collaborator has left the workspace.');

        setTimeout(() => {
            const remaining = updateUserCount(roomId);
            if (remaining === 0) {
                scheduleIdleCleanup(roomId);
            }
        }, 100);
    });

    socket.on('disconnecting', () => {
        socket.rooms.forEach((roomId) => {
            if (roomId !== socket.id) {
                socket.to(roomId).emit('user-left', 'The other collaborator has left the workspace.');

                setTimeout(() => {
                    const remaining = updateUserCount(roomId);
                    if (remaining === 0) {
                        scheduleIdleCleanup(roomId);
                    }
                }, 100);
            }
        });
    });
});

const PORT = 8084;
server.listen(PORT, () => {
    console.log('Server running on http://localhost:8084');
});
