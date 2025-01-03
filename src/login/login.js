const signUpForm = document.getElementById('signup');
const signInForm = document.getElementById('signIn');
const showSignUpLink = document.getElementById('show-register');
const showSignInLink = document.getElementById('show-login');

showSignUpLink.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent default anchor behavior
    signInForm.style.display = "none";
    signUpForm.style.display = "block";
});

showSignInLink.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent default anchor behavior
    signInForm.style.display = "block";
    signUpForm.style.display = "none";
});
