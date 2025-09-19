// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ⬇️ Your real Firebase web config (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyBixt1opmw8NLM-Yt2UFZsWYyQ-MhMXlRI",
  authDomain: "arts-leap.firebaseapp.com",
  projectId: "arts-leap",
  storageBucket: "arts-leap.firebasestorage.app",
  messagingSenderId: "776894242001",
  appId: "1:776894242001:web:e52dd0581b80a9c07079f0",
  // measurementId is only for Analytics; not needed here
};

// Make sure we only create the app once (Next.js renders multiple times)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
