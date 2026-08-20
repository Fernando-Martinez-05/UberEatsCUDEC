const firebaseConfig = {
    apiKey: "AIzaSyCVCG1mZTSmtehzYSsiMwVe5jHuChj3Vt8",
    authDomain: "ubereatsluis-a6846.firebaseapp.com",
    projectId: "ubereatsluis-a6846",
    storageBucket: "ubereatsluis-a6846.firebasestorage.app",
    messagingSenderId: "1024325712254",
    appId: "1:1024325712254:web:3da8d14956b5927591db2f"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar Firestore
const db = firebase.firestore();
