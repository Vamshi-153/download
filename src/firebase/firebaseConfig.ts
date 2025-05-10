// src/firebase/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyD6XBpRpWC8Y4aLO8ElpUWbO7I-MmFhu5w",
    authDomain: "nxtbazaar-f3ce0.firebaseapp.com",
    projectId: "nxtbazaar-f3ce0",
    storageBucket: "nxtbazaar-f3ce0.firebasestorage.app",
    messagingSenderId: "483089225252",
    appId: "1:483089225252:web:0478dd211285966348aab1",
    measurementId: "G-4ZXMR6YPWH"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app,auth, db, storage };
