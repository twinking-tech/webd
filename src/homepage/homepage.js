// Global variable to store wishlist items
let wishlist = []; // To store wishlist items

// Simulated database to store reviews
let reviewsDatabase = {};

// Function to toggle the menu visibility
function toggleMenu() {
    var menu = document.getElementById('menu');
    menu.classList.toggle('open');
}

// Close the menu if clicked outside
document.addEventListener('click', function (event) {
    var menu = document.getElementById('menu');
    var hamburger = document.querySelector('.hamburger');

    // If the click is outside the menu and hamburger icon, close the menu
    if (!menu.contains(event.target) && !hamburger.contains(event.target)) {
        menu.classList.remove('open');
    }
});
var menuLinks = document.querySelectorAll('.menu ul li a');
menuLinks.forEach(function (link) {
    link.addEventListener('click', function () {
        var menu = document.getElementById('menu');
        menu.classList.remove('open'); // Close the menu
    });
});

const UNSPLASH_ACCESS_KEY = "FEVCn2tycVZD4CyOOUUAW1ikNDekSr9aYCp-pOwqN6c";

// Function to handle the search for a city
async function searchCity(event) {
    event.preventDefault(); // Prevent form submission reload

    const searchInput = document.getElementById("searchInput").value.trim();
    const cityInfoContainer = document.getElementById("cityInfoContainer");

    // Clear previous results
    if (cityInfoContainer) {
        cityInfoContainer.remove();
    }

    if (!searchInput) {
        alert("Please enter a city name!");
        return;
    }

    try {
        // Fetch city details and images
        const [images, cityInfo] = await Promise.all([
            fetchCityImages(searchInput),
            fetchCityDescription(searchInput)
        ]);

        if (!images.length) {
            alert("No images found for this city!");
            return;
        }

        // Create a new container for city info
        const newCityInfo = document.createElement("div");
        newCityInfo.id = "cityInfoContainer";
        newCityInfo.className = "city-info";

        // Add description
        const cityDescription = document.createElement("div");
        cityDescription.className = "city-description";
        cityDescription.innerHTML = `
            <h3>${cityInfo.title || searchInput}</h3>
            <p>${cityInfo.extract || "Discover this amazing city and its attractions!"}</p>
        `;

        // Create the buttons container with flex layout for side-by-side buttons
        const buttonsContainer = document.createElement("div");
        buttonsContainer.className = "buttons-container"; // Apply the CSS class for the container

        // "Add Review" Button
        const addReviewButton = document.createElement("button");
        addReviewButton.textContent = "Add Review";
        addReviewButton.className = "review-button add-review-button"; // Apply both button and add-review class

        // "See Reviews" Button
        const seeReviewsButton = document.createElement("button");
        seeReviewsButton.textContent = "See Reviews";
        seeReviewsButton.className = "review-button see-reviews-button"; // Apply both button and see-reviews class

        // Append buttons to the container
        buttonsContainer.appendChild(addReviewButton);
        buttonsContainer.appendChild(seeReviewsButton);

        // Add click listener for "Add Review" button
        addReviewButton.onclick = function () {
            showAddReviewBox(searchInput);  // Call the function to show the Add Review box
        };

        // Add click listener for "See Reviews" button
        seeReviewsButton.onclick = function () {
            showReviews(searchInput);  // Show reviews for the specific city
        };

        // Create an image gallery
        const gallery = document.createElement("div");
        gallery.className = "city-gallery";

        images.forEach((imageUrl) => {
            const cityImage = document.createElement("img");
            cityImage.src = imageUrl;
            cityImage.alt = searchInput;
            cityImage.className = "city-image";
            gallery.appendChild(cityImage);
        });

        // Append description, buttons, and gallery to city info container
        newCityInfo.appendChild(cityDescription);
        newCityInfo.appendChild(buttonsContainer); // Add the buttons container here
        newCityInfo.appendChild(gallery);

        // Insert above the common wishlist
        const slider = document.querySelector(".slider");
        slider.insertAdjacentElement("afterend", newCityInfo);

    } catch (error) {
        console.error("Error fetching city data:", error);
        alert("Could not fetch city information. Please try again later.");
    }
}

// Function to fetch multiple city images from Unsplash API
async function fetchCityImages(cityName) {
    const query = `${cityName} city`;
    const endpoint = `https://api.unsplash.com/search/photos?query=${query}&orientation=landscape&per_page=9&client_id=${UNSPLASH_ACCESS_KEY}`;
    const response = await fetch(endpoint);

    if (!response.ok) {
        throw new Error("Failed to fetch images from Unsplash");
    }

    const data = await response.json();
    const images = data.results.map((result) => result.urls.regular);
    return images;
}

// Function to fetch city description from Wikipedia API
async function fetchCityDescription(cityName) {
    const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cityName)}`;
    const response = await fetch(endpoint);

    if (!response.ok) {
        throw new Error("Failed to fetch city information from Wikipedia");
    }

    const data = await response.json();
    return {
        title: data.title,
        extract: data.extract
    };
}

// Function to show the Add Review box
function showAddReviewBox(cityName) {
    const reviewBox = document.createElement("div");
    reviewBox.className = "review-box";
    const reviewLabel = document.createElement("div");
    reviewLabel.className = "add-review-label";
    reviewLabel.textContent = "Write a Review:";
    const reviewText = document.createElement("textarea");
    reviewText.placeholder = "Write your review here...";

    const reviewImageInput = document.createElement("input");
    reviewImageInput.className= "write";
    reviewImageInput.type = "file";
    reviewImageInput.accept = "image/*";

    const submitReviewButton = document.createElement("button");
    submitReviewButton.textContent = "Submit Review";

    // Handle submitting the review
    submitReviewButton.onclick = function () {
        const reviewData = {
            text: reviewText.value,
            imageUrl: reviewImageInput.files[0] ? URL.createObjectURL(reviewImageInput.files[0]) : null,
        };

        saveReview(cityName, reviewData);
        alert("Review added!");
        reviewBox.remove();
    };

    reviewBox.appendChild(reviewText);
    reviewBox.appendChild(reviewImageInput);
    reviewBox.appendChild(submitReviewButton);

    // Append the review box to the page
    const cityInfoContainer = document.getElementById("cityInfoContainer");
    cityInfoContainer.appendChild(reviewBox);
}

// Function to save a review to the database
function saveReview(cityName, reviewData) {
    if (!reviewsDatabase[cityName]) {
        reviewsDatabase[cityName] = [];
    }

    reviewsDatabase[cityName].push(reviewData);
}

// Function to show reviews for a specific city
// Function to show reviews for a specific city
function showReviews(cityName) {
    const reviewsDatabase = JSON.parse(localStorage.getItem('reviewsDatabase')) || {};
    const reviews = reviewsDatabase[cityName] || [];

    // Remove any existing reviews container to avoid duplication
    let reviewsContainer = document.getElementById("reviewsContainer");
    if (reviewsContainer) {
        reviewsContainer.remove();
    }

    // Create a new container for reviews with a heading
    reviewsContainer = document.createElement("div");
    reviewsContainer.id = "reviewsContainer";
    reviewsContainer.classList.add("reviews-container");

    // Heading for the reviews box
    const heading = document.createElement("h2");
    heading.id="heading";
    heading.textContent = "People's Reviews";
    heading.classList.add("reviews-heading");
    reviewsContainer.appendChild(heading);

    if (reviews.length > 0) {
        // Loop through and display all reviews
        reviews.forEach((review) => {
            const reviewDiv = document.createElement("div");
            reviewDiv.className = "review";

            // Display review text
            const reviewText = document.createElement("p");
            reviewText.textContent = review.text;
            reviewDiv.appendChild(reviewText);

            // Display review image
            if (review.imageUrl) {
                const reviewImage = document.createElement("img");
                reviewImage.src = review.imageUrl;
                reviewImage.alt = "Review Image";
                reviewImage.className = "review-image";
                reviewDiv.appendChild(reviewImage);
            }

            reviewsContainer.appendChild(reviewDiv);
        });
    } else {
        // If no reviews, display a "No reviews available" message
        const noReviewsMessage = document.createElement("p");
        noReviewsMessage.textContent = "No reviews available.";
        reviewsContainer.appendChild(noReviewsMessage);
    }

    // Append the reviews container outside the city info container
    const slider = document.querySelector(".slider"); // Place after slider or any reference
    slider.insertAdjacentElement("afterend", reviewsContainer);
}




// Function to save a review to localStorage
function saveReview(cityName, reviewData) {
    // Get the existing reviews from localStorage or initialize as an empty array
    const storedReviews = JSON.parse(localStorage.getItem('reviewsDatabase')) || {};

    if (!storedReviews[cityName]) {
        storedReviews[cityName] = [];
    }

    storedReviews[cityName].push(reviewData);

    // Save the updated reviews back to localStorage
    localStorage.setItem('reviewsDatabase', JSON.stringify(storedReviews));
}

// Function to show reviews for a specific city
function showReviews(cityName) {
    const cityInfoContainer = document.getElementById("cityInfoContainer");

    // Get the reviews from localStorage
    const reviewsDatabase = JSON.parse(localStorage.getItem('reviewsDatabase')) || {};
    const reviews = reviewsDatabase[cityName] || [];

    // Remove any previous reviews (if any)
    let reviewsContainer = document.getElementById("reviewsContainer");
    if (reviewsContainer) {
        reviewsContainer.remove();
    }

    // Create a new container for reviews
    reviewsContainer = document.createElement("div");
    reviewsContainer.id = "reviewsContainer";

    if (reviews.length > 0) {
        // Loop through and display all reviews
        reviews.forEach((review) => {
            const reviewDiv = document.createElement("div");
            reviewDiv.className = "review";

            // Display review text
            const reviewText = document.createElement("p");
            reviewText.textContent = review.text;
            reviewDiv.appendChild(reviewText);

            // Display review image
            if (review.imageUrl) {
                const reviewImage = document.createElement("img");
                reviewImage.src = review.imageUrl;
                reviewImage.alt = "Review Image";
                reviewImage.className = "review-image";
                reviewDiv.appendChild(reviewImage);
            }

            reviewsContainer.appendChild(reviewDiv);
        });
    } else {
        // If no reviews, display a "No reviews available" message
        const noReviewsMessage = document.createElement("p");
        noReviewsMessage.textContent = "No reviews available.";
        reviewsContainer.appendChild(noReviewsMessage);
    }

    // Append the reviews container to the city info container
    cityInfoContainer.appendChild(reviewsContainer);
}

