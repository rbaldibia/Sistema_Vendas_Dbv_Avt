import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuration parameters taken from Vite environment variables (.env / Vercel Environment Variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Helper check to verify if Firebase is properly configured with a Project ID
export const isFirebaseConfigured = Boolean(
  firebaseConfig.projectId && firebaseConfig.apiKey
);

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export default app;
