// js/firebase-config.js
console.log("Firebase config loaded");

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDTnInAVBWCXr710rKchHxS_Xd0QeW0zUY",
  authDomain: "lkp-dessy-f92e6.firebaseapp.com",
  databaseURL:
    "https://lkp-dessy-f92e6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lkp-dessy-f92e6",
  storageBucket: "lkp-dessy-f92e6.firebasestorage.app",
  messagingSenderId: "793343675795",
  appId: "1:793343675795:web:bbdfa5f057c90fe234ec66",
  measurementId: "G-NE2G6B24YL",
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

console.log("Firebase config loaded dengan auth", auth);
