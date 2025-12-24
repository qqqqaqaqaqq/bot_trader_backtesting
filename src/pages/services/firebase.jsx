// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQtabYKHzZFJh9Lwao3IUda-HzQTZJ-cY",
  authDomain: "backtest-b847c.firebaseapp.com",
  projectId: "backtest-b847c",
  storageBucket: "backtest-b847c.firebasestorage.app",
  messagingSenderId: "773908046220",
  appId: "1:773908046220:web:60c4cf77f1c6a742b7b6a9",
  measurementId: "G-K4TYWXKQDD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore instance
const db = getFirestore(app);

export { db };
