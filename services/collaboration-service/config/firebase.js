// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBixf7jBkfbrB2fNJxTgS_vkg0vftqPWh8",
  authDomain: "cs3219-886c1.firebaseapp.com",
  projectId: "cs3219-886c1",
  storageBucket: "cs3219-886c1.firebasestorage.app",
  messagingSenderId: "24332783908",
  appId: "1:24332783908:web:2dcf2dce99269e955fe3b1",
  measurementId: "G-FM5GK60Q25"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;