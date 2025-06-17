// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyDZMFaWuBrS0n_bXbH4c0VoZFwdfVs46Rk",
    authDomain: "pokegenetic-8c01c.firebaseapp.com",
    projectId: "pokegenetic-8c01c",
    storageBucket: "pokegenetic-8c01c.appspot.com",
    messagingSenderId: "437063751091",
    appId: "1:437063751091:web:eaa582027ecd4ad26be7c6",
    measurementId: "G-CDF2J8QB2"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
