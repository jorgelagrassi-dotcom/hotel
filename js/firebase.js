// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDUURxdGpaGOVaQKowJSfh_4ygM78_8A4s",
    authDomain: "guiacomercial-429d5.firebaseapp.com",
    projectId: "guiacomercial-429d5",
    storageBucket: "guiacomercial-429d5.firebasestorage.app",
    messagingSenderId: "821882261747",
    appId: "1:821882261747:web:dba786921dadc78107a786"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Serviços
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Exporta para o restante do sistema
export { auth, db, storage };