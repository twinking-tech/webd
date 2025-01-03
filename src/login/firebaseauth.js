// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBBB8kqkZfq8HnyAgUuuG50pqzwYJF890A",
    authDomain: "voyageverse-53d9d.firebaseapp.com",
    projectId: "voyageverse-53d9d",
    storageBucket: "voyageverse-53d9d.firebasestorage.app",
    messagingSenderId: "420027926378",
    appId: "1:420027926378:web:7b3787d6bd3089742ec713",
    measurementId: "G-Z823GZLJVX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Utility function to display messages
function showMessage(message, divId) {
    const messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(() => messageDiv.style.opacity = 0, 5000);
}

// Handle User Registration
document.getElementById('register-btn').addEventListener('click', async (event) => {
    event.preventDefault();
    const firstName = document.getElementById('fName').value.trim();
    const lastName = document.getElementById('lName').value.trim();
    const email = document.getElementById('rEmail').value.trim();
    const password = document.getElementById('pw').value;

    // Validation
    if (!firstName || !lastName || !email || !password) {
        showMessage('All fields are required', 'signUpMessage');
        return;
    }
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'signUpMessage');
        return;
    }

    try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user data in Firestore
        const userData = { firstName, lastName, email };
        await setDoc(doc(db, "users", user.uid), userData);

        showMessage('Account Created Successfully', 'signUpMessage');
        window.location.href = '../login/login.html'; // Redirect to login page
    } catch (error) {
        const errorMessage = error.code === 'auth/email-already-in-use'
            ? 'Email Address Already Exists !!!'
            : 'Unable to create User';
        showMessage(errorMessage, 'signUpMessage');
    }
});

// Handle User Login
document.getElementById('login-btn').addEventListener('click', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('psw').value;

    if (!email || !password) {
        showMessage('All fields are required', 'signInMessage');
        return;
    }

    try {
        // Sign in user with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        showMessage('Login Successful', 'signInMessage');
        localStorage.setItem('loggedInUserId', user.uid);
        window.location.href = '../homepage/homepage.html'; // Redirect to homepage
    } catch (error) {
        const errorMessage = error.code === 'auth/wrong-password'
            ? 'Incorrect Email or Password'
            : error.code === 'auth/user-not-found'
            ? 'Account does not Exist'
            : 'An error occurred';
        showMessage(errorMessage, 'signInMessage');
    }
});
