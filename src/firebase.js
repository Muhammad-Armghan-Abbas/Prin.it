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
  apiKey: "AIzaSyCQi0ZCThYBj5qaqGW_Z7-97QHh5DV_QGc",
  authDomain: "prin-it.firebaseapp.com",
  projectId: "prin-it",
  storageBucket: "prin-it.firebasestorage.app",
  messagingSenderId: "714135076598",
  appId: "1:714135076598:web:ae59611ef1be7ee21736d7",
  measurementId: "G-ZW9VR4B5DB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);
export{db,auth}