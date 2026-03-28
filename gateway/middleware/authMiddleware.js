import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

export const verifyAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        if (decodedToken.role === 'Admin') {
            req.headers['x-user-uid'] = decodedToken.uid; 
            next();
        } else {
            res.status(403).json({ error: "Admin only" });
        }
    } catch (e) {
        res.status(401).json({ error: "Invalid Token" });
    }
};

export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const checkRevoked = true
        const decodedToken = await admin.auth().verifyIdToken(idToken,checkRevoked);
        req.headers['x-user-data'] = JSON.stringify(decodedToken);
        next();
    } catch (error) {
        console.error("Error verifying token:", error);
        return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    }
};