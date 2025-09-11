// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration (Discussion Project)
const discussionConfig = {
  apiKey: "AIzaSyB7eZyf7UY540WxInS6nertI0LMIl4wQdE",
  authDomain: "hackthon-ef882.firebaseapp.com",
  projectId: "hackthon-ef882",
  storageBucket: "hackthon-ef882.appspot.com", // ✅ fixed typo: must be .appspot.com
  messagingSenderId: "609780987951",
  appId: "1:609780987951:web:4c45874d441e917877aeda",
  measurementId: "G-Y1HN36PRWG"
};

// ✅ Initialize with a custom name to avoid duplicate-app error
const discussionApp = getApps().find(app => app.name === "discussionApp")
  ? getApps().find(app => app.name === "discussionApp")
  : initializeApp(discussionConfig, "discussionApp");

// Services for this discussion app
const discussionAnalytics = getAnalytics(discussionApp);
const discussionDb = getFirestore(discussionApp);
const discussionStorage = getStorage(discussionApp);
const discussionAuth = getAuth(discussionApp);

// Export everything you need
export {
  discussionApp,
  discussionAnalytics,
  discussionDb,
  discussionDb as discussionFirestore,
  discussionStorage,
  discussionAuth
};
