const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
    projectId: "YOUR_FIREBASE_PROJECT_ID",
    storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Cloudinary Configuration
const cloudinaryConfig = {
    cloudName: "dxzjvwbdz", // Replace with your Cloudinary cloud name
    uploadPreset: "dhanya", // Replace with the preset name
};

// Function to upload image to Cloudinary
async function uploadToCloudinary(file) {
    try {
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", cloudinaryConfig.uploadPreset);

        const response = await fetch(cloudinaryUrl, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        if (response.ok) {
            return data; // Contains secure_url
        } else {
            throw new Error(data.error.message);
        }
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
}

// Show Add Review Box
function showAddReviewBox() {
    const cityInfoContainer = document.getElementById("cityInfoContainer");
    let reviewBox = document.getElementById("reviewBox");

    if (!reviewBox) {
        reviewBox = document.createElement("div");
        reviewBox.id = "reviewBox";
        reviewBox.style.display = "flex";
        reviewBox.style.flexDirection = "column";
        reviewBox.style.gap = "10px";
        reviewBox.style.padding = "20px";
        reviewBox.style.border = "1px solid #ddd";
        reviewBox.style.borderRadius = "10px";
        reviewBox.style.marginTop = "20px";
        reviewBox.style.backgroundColor = "#f9f9f9";
        reviewBox.style.width = "80vw";

        const heading = document.createElement("h3");
        heading.textContent = "Add Your Review";

        const reviewTextarea = document.createElement("textarea");
        reviewTextarea.id = "reviewText";
        reviewTextarea.placeholder = "Write your review here...";
        reviewTextarea.style.width = "100%";
        reviewTextarea.style.height = "100px";
        reviewTextarea.style.padding = "10px";

        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.style.marginTop = "10px";

        const submitButton = document.createElement("button");
        submitButton.textContent = "Submit Review";
        submitButton.style.padding = "10px 20px";
        submitButton.style.backgroundColor = "#4CAF50";
        submitButton.style.color = "#fff";
        submitButton.style.border = "none";
        submitButton.style.borderRadius = "5px";
        submitButton.style.cursor = "pointer";

        submitButton.addEventListener("click", async () => {
            const reviewText = reviewTextarea.value.trim();
            const file = fileInput.files[0];

            if (!reviewText || !file) {
                alert("Please provide both a review and an image.");
                return;
            }

            try {
                const imageData = await uploadToCloudinary(file);

                const reviewData = {
                    text: reviewText,
                    imageUrl: imageData.secure_url,
                    timestamp: new Date().toISOString(),
                };

                await db.collection("reviews").add(reviewData);
                alert("Review submitted successfully!");
                reviewTextarea.value = "";
                fileInput.value = "";
            } catch (error) {
                alert("Error submitting review. Please try again.");
            }
        });

        reviewBox.appendChild(heading);
        reviewBox.appendChild(reviewTextarea);
        reviewBox.appendChild(fileInput);
        reviewBox.appendChild(submitButton);
        cityInfoContainer.appendChild(reviewBox);
    } else {
        reviewBox.style.display =
            reviewBox.style.display === "none" ? "flex" : "none";
    }
}