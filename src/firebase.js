// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
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
let auth;
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { auth, signInWithEmailAndPassword, db };

// Admin setup function - Run this once in your development environment
export const setupAdmin = async (email, password) => {
  try {
    // Create admin user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Get the user's ID token
    const idToken = await userCredential.user.getIdToken();

    // Call your backend API to set admin claim
    // You'll need to set up a backend endpoint that uses Firebase Admin SDK
    const response = await fetch('/api/setAdminClaim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ uid: userCredential.user.uid })
    });

    if (!response.ok) {
      throw new Error('Failed to set admin claim');
    }

    console.log('Admin user created successfully');
    return userCredential.user;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
};