import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBIaJrKa9-2gqlj3CzE4GHwgICSOZgODAw",
  authDomain: "recipe-box-6d72.firebaseapp.com",
  projectId: "recipe-box-6d72",
  storageBucket: "recipe-box-6d72.firebasestorage.app",
  messagingSenderId: "1091688303902",
  appId: "1:1091688303902:web:998937b4c8d1393cb3cd0f",
  measurementId: "G-4PX2TNN47K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const {db} = getFirestore(app);