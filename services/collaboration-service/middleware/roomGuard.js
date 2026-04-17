import { getSession, isParticipant } from '../sessionStore.js';

const roomGuard = (req, res, next) => {
    const roomId = req.params.roomid || req.body.roomId || req.query.roomId;
    const userId = req.body.userId || req.query.userId;

    if (!roomId) {
        return res.status(400).json({ message: "No Room ID provided." });
    }

    const session = getSession(roomId);
    if (!session) {
        return res.status(404).json({ message: "Session not found." });
    }

    if (userId && !isParticipant(roomId, userId)) {
        return res.status(403).json({
            message: "Access Denied: You are not a member of this session."
        });
    }

    next();
};

export default roomGuard;
