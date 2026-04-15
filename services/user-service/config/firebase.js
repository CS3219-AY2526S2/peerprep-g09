import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('../serviceAccountKey.json');

console.log("Checking Firebase connection...");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

console.log("Firebase Admin SDK Initialized for Project:", serviceAccount.project_id);

export default { admin, db, auth };