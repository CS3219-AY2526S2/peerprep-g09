import express from 'express';
import 'dotenv/config';
import firebaseApp from '../config/firebase.js';
import Validator from '../utils/validation.js';
import { verifyInternalService } from '../middleware/internalAuth.js';
import nodemailer from 'nodemailer';
import multer from 'multer';
import admin from 'firebase-admin';
import {FieldValue} from 'firebase-admin/firestore';


const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
const FIREBASE_API_KEY = process.env.FIREBASE_WEB_API_KEY;
const DEFAULT_PFP_URL = process.env.DEFAULT_PFP_URL;

const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  secure: true,
  port: 465,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY, 
  },
});

const buildProgressUpdatePayload = ({ questionDifficulty, questionTopics }) => {
    const normalizedDifficulty =
        String(questionDifficulty || "Unknown").trim() || "Unknown";
    const normalizedTopics = Array.isArray(questionTopics)
        ? questionTopics
            .map((topic) => String(topic || "").trim())
            .filter(Boolean)
        : [];

    return {
        difficulty: normalizedDifficulty,
        topics: normalizedTopics,
    };
};

const updateProgressForUser = async ({
    uid,
    questionId,
    questionDifficulty,
    questionTopics,
}) => {
    if (!uid) {
        const error = new Error("User ID is required.");
        error.statusCode = 400;
        throw error;
    }

    if (!questionId) {
        const error = new Error("Question ID is required.");
        error.statusCode = 400;
        throw error;
    }

    const { difficulty, topics } = buildProgressUpdatePayload({
        questionDifficulty,
        questionTopics,
    });

    const userRef = firebaseApp.db.collection('users').doc(uid);
    const progressRef = userRef.collection('QuestionsAttempted').doc(String(questionId));
    const docSnapshot = await progressRef.get();

    if (docSnapshot.exists) {
        return {
            alreadyRecorded: true,
            message: "Progress already updated for this question.",
        };
    }

    await progressRef.set({
        questionId: String(questionId),
        difficulty,
        topics,
        completedAt: FieldValue.serverTimestamp()
    });

    const statsUpdate = {
        totalAttempted: FieldValue.increment(1),
        [`stats.difficulty.${difficulty}`]: FieldValue.increment(1)
    };

    topics.forEach((topic) => {
        statsUpdate[`stats.category.${topic}`] = FieldValue.increment(1);
    });

    await userRef.update(statsUpdate);

    return {
        alreadyRecorded: false,
        message: "Progress and stats updated for the first time",
    };
};

router.patch('/update-profilePic', upload.single('image'), async (req, res) => {
    const userData = JSON.parse(req.headers['x-user-data']);
    const uid = userData.uid
    const file = req.file;

    if (!file) return res.status(400).send("No file uploaded.");

    try {
        const bucket = admin.storage().bucket("peerprep-g9.firebasestorage.app");
        const blob = bucket.file(`profile_pics/${uid}_${Date.now()}`);
        const blobStream = blob.createWriteStream({
            metadata: { contentType: file.mimetype }
        });
        blobStream.on('error', (err) => res.status(500).send(err));
        blobStream.on('finish', async () => {
            await blob.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            await firebaseApp.db.collection('users').doc(uid).update({
                photoURL: publicUrl
            });

            res.status(200).json({ photoURL: publicUrl });
        });

        blobStream.end(file.buffer);
    } catch (error) {
        console.log(error)
        res.status(500).send("Upload failed.");
    }
});

router.post('/oAuth-Login', async (req,res) => {
    const userData = JSON.parse(req.headers['x-user-data']);
    const uid = userData.uid
    const email = userData.email

    try {
        const userRef = firebaseApp.db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            const newUser = {
                uid,
                email,
                displayName: "Default username",
                photoURL: DEFAULT_PFP_URL,
                role: 'User',
                createdAt: new Date().toISOString()
            };
            await userRef.set(newUser);
            await firebaseApp.auth.setCustomUserClaims(uid, { 
                role: 'User', 
                displayName: "Default username" 
            });
            return res.status(201).json({ message: "Account created and logged in", user: newUser });
        }
        res.status(200).json({ message: "Login successful", user: userDoc.data() });

    } catch (err) {
        res.status(500).json({ error: "Database sync error" });
    }
})
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
            password: password,
            displayName: "Default username",
            photoURL: DEFAULT_PFP_URL
        });

    
        await firebaseApp.auth.setCustomUserClaims(userRecord.uid, { role: 'User', displayName: "Default username" });

        await firebaseApp.db.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: email,
            displayName: "Default username",
            photoURL: DEFAULT_PFP_URL,
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

router.patch('/demote-self', async (req, res) => {
    const userData = JSON.parse(req.headers['x-user-data']);
    const uid = userData.uid
    const adminQuery = await firebaseApp.db.collection('users')
        .where('role', '==', 'Admin')
        .get();
    if (adminQuery.size <= 1) {
        return res.status(403).json({
            error: "Cannot demote the last Admin account. Please promote another user first." 
        });
    }
    try {
        await firebaseApp.auth.setCustomUserClaims(uid, { role: 'User' });
        await firebaseApp.db.collection('users').doc(uid).update({ role: 'User' });
        res.status(200).json({ message: `Admin demoted to User` });
        await firebaseApp.auth.revokeRefreshTokens(uid);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/update-password', async (req, res) => {
    const {newPassword,oldPassword} = req.body;
    const userData = JSON.parse(req.headers['x-user-data']);
    const uid = userData.uid
    console.log(userData)
    if (!newPassword || !oldPassword) {
        return res.status(400).json({ error: "Both old and new passwords are required." });
    }
    if (!Validator.validatePassword(newPassword)) {
        return res.status(400).json({ 
            error: "Password must be 8+ chars with uppercase, lowercase, and a number." 
        });
    }
    try {
        const userRecord = await firebaseApp.auth.getUser(uid);
        const email = userRecord.email;
        const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
        const verifyResponse = await fetch(signInUrl, {
            method: 'POST',
            body: JSON.stringify({
                email: email,
                password: oldPassword,
                returnSecureToken: false
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!verifyResponse.ok) {
            return res.status(401).json({ error: "The old password you entered is incorrect." });
        }
        await firebaseApp.auth.updateUser(uid, {
            password: newPassword
        });
        await firebaseApp.auth.revokeRefreshTokens(uid);

        res.status(200).json({ message: "Password updated successfully." });
    }catch(error) {
        console.error("Update Password Error:", error);
        res.status(500).json({ error: "Server error during password update." });
    }
}
)

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

router.delete('/delete-account', async (req,res) => {
    try{
        const userData = JSON.parse(req.headers['x-user-data']);
        const uid = userData.uid
        const role = userData.role
        if (role == 'Admin'){
            const adminQuery = await firebaseApp.db.collection('users')
                .where('role', '==', 'Admin')
                .get();
            if (adminQuery.size <= 1) {
                return res.status(403).json({ 
                    error: "Cannot delete the last Admin account. Please promote another user first." 
                });
            }
        }
    await firebaseApp.db.collection('users').doc(uid).delete();
    await firebaseApp.auth.deleteUser(uid);
    res.status(200).json({ message: "Account successfully deleted." });
    }catch(err){
        console.error("Delete Account Error:", err);
        res.status(500).json({ error: "Server error during account deletion." });
    }
})

router.patch('/update-displayName', async (req, res) => {
  const { displayName } = req.body;
  const userData = JSON.parse(req.headers['x-user-data']);
  const uid = userData.uid
  if (!displayName) {
    return res.status(400).send("Display name is required");
  }

  try {
    await firebaseApp.db.collection('users').doc(uid).set({
      displayName: displayName
    }, { merge: true });

    await firebaseApp.auth.setCustomUserClaims(uid, { 
      displayName: displayName 
    });

    res.status(200).send({ message: "Display name updated successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating display name");
  }
});

router.post('/update-progress', async (req, res) => {
    try {
        const userData = JSON.parse(req.headers['x-user-data']);
        const uid = userData.uid;
        const { questionId, questionDifficulty, questionTopics } = req.body;
        const result = await updateProgressForUser({
            uid,
            questionId,
            questionDifficulty,
            questionTopics,
        });

        res.status(200).json({ message: result.message });

    } catch (error) {
        console.error("Update Progress Error:", error);
        res
            .status(error.statusCode || 500)
            .json({ error: error.message || "Failed to update progress." });
    }
});

router.post('/internal/update-progress', verifyInternalService, async (req, res) => {
    try {
        const { uid, questionId, questionDifficulty, questionTopics } = req.body;
        const result = await updateProgressForUser({
            uid,
            questionId,
            questionDifficulty,
            questionTopics,
        });

        res.status(200).json({ message: result.message });
    } catch (error) {
        console.error("Internal Update Progress Error:", error);
        res
            .status(error.statusCode || 500)
            .json({ error: error.message || "Failed to update progress." });
    }
});

router.get('/get-stats', async (req, res) => {
    try {
        const userData = JSON.parse(req.headers['x-user-data']);
        const uid = userData.uid;

        const userDoc = await firebaseApp.db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User profile not found." });
        }

        const data = userDoc.data();
        
        const stats = data.stats || {};

        res.status(200).json({
            totalAttempted: data.totalAttempted || 0,
            byDifficulty: stats.difficulty || {},
            byCategory: stats.category || {}
        });

    } catch (error) {
        console.error("Fetch Stats Error:", error);
        res.status(500).json({ error: "Failed to retrieve user statistics." });
    }
});

export default router;

