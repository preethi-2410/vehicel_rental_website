import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyBbS4vVTs7Nncdf3VMzW7NhK0nWfpJzOzM",
  authDomain: "vroomgo-f5638.firebaseapp.com",
  projectId: "vroomgo-f5638",
  storageBucket: "vroomgo-f5638.appspot.com",
  messagingSenderId: "595905357042",
  appId: "1:595905357042:web:1e365a9bf2f45772d71c6b",
  measurementId: "G-8Y079ENJNZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app; 