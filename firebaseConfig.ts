// Firebase configuration using environment variables
// NEVER commit actual API keys to version control
// Add your Firebase config values to a local .env file (not committed to git)

import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

// Check if Firebase is properly configured (not placeholder values)
const isFirebaseConfigured = () => {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  // Check that values are not placeholders
  return apiKey && apiKey !== 'your_api_key_here' && 
         projectId && projectId !== 'your_project_id';
};

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// Initialize Firebase only if properly configured
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize Firebase:', error);
  }
} else {
  console.log('Firebase not configured - running in offline/guest mode');
}

export { app, auth, db };

