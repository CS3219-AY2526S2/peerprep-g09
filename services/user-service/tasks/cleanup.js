import cron from 'node-cron';
import firebaseApp from '../config/firebase.js';

export const purgeUnverifiedUsers = async () => {
    console.log('--- Checking for expired unverified accounts ---');
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    try {
        const snapshot = await firebaseApp.db.collection('users')
            .where('createdAt', '<', cutoff)
            .get();
        
        if (snapshot.empty) return;
        for (const doc of snapshot.docs) {
            const uid = doc.id;
            const userAuth = await firebaseApp.auth.getUser(uid);
            console.log(userAuth)
            if (!userAuth.emailVerified) {
                await firebaseApp.auth.deleteUser(uid);
                await doc.ref.delete();
                console.log(`[CLEANUP] Deleted unverified user: ${uid}`);
            }
        }
    } catch (error) {
        console.error("[CLEANUP ERROR]:", error.message);
    }
};

export const initCleanupCron = () => {
    cron.schedule('0 * * * *', purgeUnverifiedUsers);
};