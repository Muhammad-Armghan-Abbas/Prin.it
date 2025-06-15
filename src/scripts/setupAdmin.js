import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCQi0ZCThYBj5qaqGW_Z7-97QHh5DV_QGc",
  authDomain: "prin-it.firebaseapp.com",
  projectId: "prin-it",
  storageBucket: "prin-it.firebasestorage.app",
  messagingSenderId: "714135076598",
  appId: "1:714135076598:web:ae59611ef1be7ee21736d7",
  measurementId: "G-ZW9VR4B5DB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get admin email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.error('Please provide both email and password as arguments.');
    console.log('Usage: node setupAdmin.js <email> <password>');
    process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
    console.error('Invalid email format');
    process.exit(1);
}

// Validate password strength
if (password.length < 8) {
    console.error('Password must be at least 8 characters long');
    process.exit(1);
}

const db = getFirestore(app);

async function setupAdmin() {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Set admin role in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    
    console.log('Admin user created successfully:', userCredential.user.email);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
}

setupAdmin();
