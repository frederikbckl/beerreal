// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAFoXtDVK0sRTG4YayM3OjqYXJNaUY58EE",
  authDomain: "beerreal-8019b.firebaseapp.com",
  projectId: "beerreal-8019b",
  storageBucket: "beerreal-8019b.firebasestorage.app",
  messagingSenderId: "773882256697",
  appId: "1:773882256697:web:addca7c3ed6ff895109ce8",
  measurementId: "G-ZK78BQCVRC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

