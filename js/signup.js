
const privacyCheckbox = document.getElementById("privacy");
const signupButton = document.getElementById("signup-button");
const signupForm = document.getElementById("signup-form");

function checkSignupForm() {
  signupButton.disabled = !(
    privacyCheckbox.checked && signupForm.checkValidity()
  );
}

privacyCheckbox.addEventListener("change", checkSignupForm);

signupForm.addEventListener("input", checkSignupForm);