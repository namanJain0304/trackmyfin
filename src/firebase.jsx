// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAVt9efyV254JjNUTM-W9rVkpNbqVXyPgs",
  authDomain: "trackmyfin.firebaseapp.com",
  projectId: "trackmyfin",
  storageBucket: "trackmyfin.appspot.com",
  messagingSenderId: "996438455364",
  appId: "1:996438455364:web:f10efbb69d5f4e20e53811",
  measurementId: "G-33BBLPZM4F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { db, auth, provider, doc, setDoc };