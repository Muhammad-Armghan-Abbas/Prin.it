const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { initializeApp } = require('firebase/app');

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

const email = 'armaghanabbas11@gmail.com';
const password = 'Arm@gh@n1122';

async function setupAdmin() {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Admin user created successfully:', userCredential.user.email);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
}

setupAdmin();
