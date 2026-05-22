import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCR88ybvOtt44VWwVeIyttakN9qcF1Jf5A",
  authDomain: "kitch-ea06f.firebaseapp.com",
  projectId: "kitch-ea06f",
  storageBucket: "kitch-ea06f.firebasestorage.app",
  messagingSenderId: "1073404853721",
  appId: "1:1073404853721:web:c2f9ebcccf21c6f72c6dc8",
  measurementId: "G-215BKJ37N7",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);
