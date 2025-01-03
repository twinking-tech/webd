// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBBB8kqkZfq8HnyAgUuuG50pqzwYJF890A",
    authDomain: "voyageverse-53d9d.firebaseapp.com",
    projectId: "voyageverse-53d9d",
    storageBucket: "voyageverse-53d9d.firebasestorage.app",
    messagingSenderId: "420027926378",
    appId: "1:420027926378:web:7b3787d6bd3089742ec713",
    measurementId: "G-Z823GZLJVX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
console.log(db); // Should log an initialized Firestore instance

// Handle user state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        const email = user.email;
        console.log("User logged in:", email);

        // Check if wishlist is stored in localStorage
        const storedWishlist = localStorage.getItem(`wishlist_${email}`);
        if (storedWishlist) {
            console.log("Loading wishlist from localStorage.");
            updateWishlistDisplay(JSON.parse(storedWishlist));
        }

        // Fetch the latest wishlist from Firestore in the background
        fetchWishlist(email);
    } else {
        console.log("User not logged in.");
        localStorage.clear(); // Clear all stored data for security
    }
});
// Creating the wishlist button
const wishlistButton = document.createElement("button");
wishlistButton.className = "wishlist-button";
wishlistButton.textContent = "Add to Wishlist";

// Add event listener to the wishlist button
wishlistButton.onclick = () => {
    const searchInput = document.getElementById("searchInput"); // Ensure this ID matches your input field
    if (searchInput) {
        const cityName = searchInput.value.trim();
        if (cityName) {
            addToWishlist(cityName);
            alert(`${cityName} added to your wishlist!`);
        } else {
            alert("Please enter a valid city name.");
        }
    } else {
        alert("Search input not found.");
    }
};

// Assuming the button is added to the DOM somewhere (e.g., a form or container)
document.body.appendChild(wishlistButton);

// Function to add item to wishlist
async function addToWishlist(cityName) {
    const user = auth.currentUser;
    if (!user) {
        alert("Please log in to add items to your wishlist.");
        return;
    }

    const email = user.email;
    try {
        const wishlistRef = doc(db, "wishlists", email);
        const wishlistDoc = await getDoc(wishlistRef);

        let wishlist = [];
        if (wishlistDoc.exists()) {
            wishlist = wishlistDoc.data().wishlist || [];
        }

        if (!wishlist.includes(cityName)) {
            wishlist.push(cityName);
            console.log("Updated wishlist:", wishlist); // Log updated wishlist
            await setDoc(wishlistRef, { wishlist: wishlist }); // Store updated wishlist
            console.log(`${cityName} added to wishlist.`);
            updateWishlistDisplay(wishlist);
            // Update localStorage
            localStorage.setItem(`wishlist_${email}`, JSON.stringify(wishlist));
        } else {
            alert(`${cityName} is already in your wishlist.`);
        }
    } catch (error) {
        console.error("Error adding to wishlist:", error); // Log the error
    }
}

// Fetch wishlist using email
async function fetchWishlist(email) {
    try {
        const wishlistRef = doc(db, "wishlists", email);
        const wishlistDoc = await getDoc(wishlistRef);

        // Ensure the wishlist is an array
        const wishlist = wishlistDoc.exists() && Array.isArray(wishlistDoc.data().wishlist)
            ? wishlistDoc.data().wishlist
            : [];

        console.log("Wishlist fetched from Firestore:", wishlist);

        // Save wishlist to localStorage
        localStorage.setItem(`wishlist_${email}`, JSON.stringify(wishlist));

        updateWishlistDisplay(wishlist); // Update the UI
    } catch (error) {
        console.error("Error fetching wishlist:", error);
    }
}

function updateWishlistDisplay(wishlist) {
    const wishlistContainer = document.getElementById("wishlistContainer");
    if (!wishlistContainer) {
        console.error("Element with ID 'wishlistContainer' not found in the DOM.");
        return;
    }

    wishlistContainer.innerHTML = ""; // Clear existing items

    // Create a single big box to hold all wishlist items
    const bigBox = document.createElement("div");
    bigBox.className = "big-box";
    
    // Add a heading to the big box
    const heading = document.createElement("h2");
    heading.textContent = "Your Wishlisted Cities";
    bigBox.appendChild(heading); // Append the heading to the big box

    // Add each city as a row in the big box
    wishlist.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "wishlist-item";

        // Add city name
        const cityName = document.createElement("span");
        cityName.textContent = item;
         

        // Create a remove button for each city
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.className = "remove-button";

        // Add event listener to remove city from the wishlist
        removeButton.onclick = async () => {
            await removeFromWishlist(item, index); // Handle the removal of the city from the wishlist
        };

        // Append city name and remove button to the itemDiv
        itemDiv.appendChild(cityName);
        itemDiv.appendChild(removeButton);

        

        // Remove bottom border for the last item
        if (wishlist.indexOf(item) === wishlist.length - 1) {
            itemDiv.style.borderBottom = "none";
        }

        bigBox.appendChild(itemDiv); // Append item to the big box
    });

    // Append the big box to the wishlist container
    wishlistContainer.appendChild(bigBox);
}

// Function to handle the removal of a city from the wishlist
async function removeFromWishlist(cityName, index) {
    const user = auth.currentUser;
    if (!user) {
        alert("Please log in to remove items from your wishlist.");
        return;
    }

    const email = user.email;
    try {
        const wishlistRef = doc(db, "wishlists", email);
        const wishlistDoc = await getDoc(wishlistRef);

        if (wishlistDoc.exists()) {
            let wishlist = wishlistDoc.data().wishlist || [];
            wishlist.splice(index, 1); // Remove the city at the specified index

            // Update the Firestore wishlist
            await setDoc(wishlistRef, { wishlist: wishlist });
            console.log(`${cityName} removed from wishlist.`);
            
            // Update localStorage
            localStorage.setItem(`wishlist_${email}`, JSON.stringify(wishlist));

            // Update the display to reflect the removal
            updateWishlistDisplay(wishlist);
        }
    } catch (error) {
        console.error("Error removing from wishlist:", error);
    }
}
