import express from 'express';
import 'dotenv/config';
import firebaseApp from '../config/firebase.js';
import Validator from '../utils/validation.js';
import verifyAdmin  from '../middleware/authMiddleware.js';

const router = express.Router();
const FIREBASE_API_KEY = process.env.FIREBASE_WEB_API_KEY;

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                email,
                password,
                returnSecureToken: true
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        res.status(200).json({
            message: "Login successful",
            accessToken: data.idToken,      
            refreshToken: data.refreshToken, 
            uid: data.localId
        });

    } catch (err) {
        res.status(500).json({ error: "Server error during login." });
    }
});

router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!Validator.validateEmail(email)) {
        return res.status(400).json({ error: "Invalid email format." });
    }

    if (!Validator.validatePassword(password)) {
        return res.status(400).json({ 
            error: "Password must be 8+ chars with uppercase, lowercase, and a number." 
        });
    }

    try {
        const userRecord = await firebaseApp.auth.createUser({
            email: email,
            password: password
        });

        await firebaseApp.auth.setCustomUserClaims(userRecord.uid, { role: 'User' });

    
        await firebaseApp.db.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: email,
            role: 'User', 
            createdAt: new Date().toISOString()
        });
        
        res.status(201).json({ 
            message: "User created successfully with default 'User' role", 
            uid: userRecord.uid 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/logout', async (req, res) => {
    const { uid } = req.body;
    if (!uid) {
        return res.status(400).json({ error: "UID is required to logout." });
    }
    try {
        await firebaseApp.auth.revokeRefreshTokens(uid);
        
        res.status(200).json({ message: "Logout successful. Refresh tokens revoked." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/promote-user', verifyAdmin, async (req, res) => {
    const { uidToPromote } = req.body;
    try {
    
        await firebaseApp.auth.setCustomUserClaims(uidToPromote, { role: 'Admin' });
        
        await firebaseApp.db.collection('users').doc(uidToPromote).update({ role: 'Admin' });

        res.status(200).json({ message: `User promoted to Admin` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;