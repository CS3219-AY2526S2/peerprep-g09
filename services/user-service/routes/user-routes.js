import express from 'express';
import 'dotenv/config';
import firebaseApp from '../config/firebase.js';
import Validator from '../utils/validation.js';
import verifyAdmin  from '../middleware/authMiddleware.js';
import nodemailer from 'nodemailer';

const router = express.Router();
const FIREBASE_API_KEY = process.env.FIREBASE_WEB_API_KEY;

const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  secure: true,
  port: 465,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY, 
  },
});

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

        const userRecord = await firebaseApp.auth.getUser(data.localId);

        if (!userRecord.emailVerified) {
            return res.status(403).json({ 
                error: "Your email has not been verified. Please check your inbox." 
            });
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

       
        const actionCodeSettings = {
            url: 'http://localhost:3000/login', 
        };
        const verificationLink = await firebaseApp.auth.generateEmailVerificationLink(email, actionCodeSettings);

    
        const senderEmail = process.env.EMAIL_USER;
        const recipientEmail = process.env.TEST_RECIPIENT_EMAIL;

        const mailOptions = {
            from: `"PeerPrep Support" <${senderEmail}>`, 
            to: recipientEmail,
            subject: 'Verify your PeerPrep Account',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; color: #333;">
                    <h2 style="color: #007bff;">Welcome to PeerPrep!</h2>
                    <p>Thanks for joining! Please verify your email address to activate your account.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" 
                        style="display: inline-block; padding: 12px 25px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Verify My Account
                        </a>
                    </div>
                    <p style="font-size: 12px; color: #777;">
                        If the button above doesn't work, copy and paste this link into your browser: <br>
                        <span style="color: #007bff;">${verificationLink}</span>
                    </p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 11px; color: #999;">This link will expire in 24 hours.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        
        res.status(201).json({ 
            message: "User created successfully. A verification email has been sent to your inbox.", 
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

router.patch('/promote-user', async (req, res) => {
    const { uidToPromote } = req.body;
    try {
    
        await firebaseApp.auth.setCustomUserClaims(uidToPromote, { role: 'Admin' });
        
        await firebaseApp.db.collection('users').doc(uidToPromote).update({ role: 'Admin' });

        res.status(200).json({ message: `User promoted to Admin` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required." });
    }

    try {
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                requestType: "PASSWORD_RESET",
                email: email
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(400).json({ error: data.error.message });
        }

        res.status(200).json({ message: "Password reset email sent successfully!" });

    } catch (err) {
        res.status(500).json({ error: "Server error sending reset email." });
    }
});

export default router;