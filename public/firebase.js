// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDTQwwSM6cVxa8vkxvl6lFSOK57b3w5Ll8",
  authDomain: "ev-car-wale.firebaseapp.com",
  projectId: "ev-car-wale",
  storageBucket: "ev-car-wale.firebasestorage.app",
  messagingSenderId: "599485952914",
  appId: "1:599485952914:web:8987e2f0c73c329139874b",
  measurementId: "G-QDVXE2211F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
