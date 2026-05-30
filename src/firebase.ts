import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Atom FinAI's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8Z6W_pdVDPsgpFEPe9YXR1djZ5HCXuqs",
  authDomain: "atomfinai.firebaseapp.com",
  projectId: "atomfinai",
  storageBucket: "atomfinai.firebasestorage.app",
  messagingSenderId: "780541311198",
  appId: "1:780541311198:web:efda91769fa321c2fb2a4f",
  measurementId: "G-SKEWYRBL5D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Provider Config
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;
