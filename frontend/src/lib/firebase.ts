import { initializeApp, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function initializeFirebase() {
  if (typeof window === "undefined") {
    throw new Error("Firebase can only be initialized in the browser");
  }

  try {
    app = getApp();
  } catch {
    app = initializeApp(firebaseConfig);
  }

  if (!auth) {
    auth = getAuth(app);
  }

  return auth;
}

export function getFirebaseAuth() {
  if (!auth) {
    return initializeFirebase();
  }
  return auth;
}
