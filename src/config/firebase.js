// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth'; // Firebase Authentication

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAxuf00UUgiOrH-O-sRF1yJX3dMOLvhuVE',
  authDomain: 'shop-nest-278.firebaseapp.com',
  databaseURL: 'https://shop-nest-278-default-rtdb.firebaseio.com',
  projectId: 'shop-nest-278',
  storageBucket: 'shop-nest-278.appspot.com',
  messagingSenderId: '914929799860',
  appId: '1:914929799860:web:7d6ba6c8752a67de8cfde1',
  measurementId: 'G-EV4B5G2JLD',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const fireStore = getFirestore(app); // Firestore instance
const storage = getStorage(app); // Firebase Storage instance
const auth = getAuth(app); // Firebase Auth instance

// Export everything you need
export { app, analytics, fireStore, fireStore as db, storage, auth }; // Export both `fireStore` and `db`
