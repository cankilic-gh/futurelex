import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAardw7xTzChs9ASb21Lf06RAa4GWxZXEI",
  authDomain: "futurelex-80a87.firebaseapp.com",
  projectId: "futurelex-80a87",
  storageBucket: "futurelex-80a87.firebasestorage.app",
  messagingSenderId: "708286806460",
  appId: "1:708286806460:web:a2bcd7f708c064a61153b9",
  measurementId: "G-VV8LTXHMVY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Services
export const auth = getAuth(app);
export const db = getFirestore(app);
