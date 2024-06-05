// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
//import { getAnalytics } from "firebase/analytics";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB8dQoyGpojDPToSrFCGaZNbZXnysRDIO8",
  authDomain: "krnel-77479.firebaseapp.com",
  projectId: "krnel-77479",
  storageBucket: "krnel-77479.appspot.com",
  messagingSenderId: "343271018448",
  appId: "1:343271018448:web:b2dce65487acc3a3f9b3d5",
  measurementId: "G-4LZ0ER9L9S"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
//const analytics = getAnalytics(app);

export { auth, db };
