import admin from 'firebase-admin';
import serviceAccount from "../serviceAccountKey.json"

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;