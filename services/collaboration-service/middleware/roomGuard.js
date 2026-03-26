const roomGuard = (req, res, next) => {
    const roomId = req.params.roomid || req.body.roomId;
    
    // In the future, this will be req.user.uid from your Auth Middleware
    const userId = req.body.userId; 

    if (!roomId) {
        return res.status(400).json({ message: "No Room ID provided." });
    }

    const arr = roomId.split('-');
    if (arr.length !== 4) {
        return res.status(400).json({ message: "Malformed Room ID." });
    }

    const isAuthorized = (String(userId) === arr[2] || String(userId) === arr[3]);
    if (!isAuthorized) {
        return res.status(403).json({ 
            message: "Access Denied: You are not a member of this session." 
        });
    }

    next();
};

module.exports = roomGuard;