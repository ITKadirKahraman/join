/** @type {HTMLInputElement} */
const nameInput = document.getElementById("name");
/** @type {HTMLInputElement} */
const emailInput = document.getElementById("email");
/** @type {HTMLInputElement} */
const passwordInput = document.getElementById("password");
/** @type {HTMLInputElement} */
const confirmInput = document.getElementById("confirm-password");
/** @type {HTMLInputElement} */
const privacyCheckbox = document.getElementById("privacy");
/** @type {HTMLButtonElement} */
const signupButton = document.getElementById("signup-button");
/** @type {HTMLFormElement} */
const signupForm = document.getElementById("signup-form");

/** @type {RegExp} Basic email format check */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** @type {number} Minimum password length */
const MIN_PASSWORD_LENGTH = 8;

/** @type {HTMLInputElement[]} All validated input fields */
const fields = [nameInput, emailInput, passwordInput, confirmInput];
/** @type {Set<HTMLInputElement>} Fields the user has already interacted with */
const touched = new Set();

/* ---------- Validation messages ---------- */

/**
 * Validates the name field.
 * @returns {string} Error message, or an empty string if valid
 */
function nameMessage() {
  return nameInput.value.trim() ? "" : "Bitte einen Namen eingeben.";
}

/**
 * Validates the email field.
 * @returns {string} Error message, or an empty string if valid
 */
function emailMessage() {
  const email = emailInput.value.trim();
  if (!email) return "Bitte eine E-Mail-Adresse eingeben.";
  if (!EMAIL_REGEX.test(email)) {
    return "Bitte eine gültige E-Mail-Adresse eingeben.";
  }
  return "";
}

/**
 * Validates the password field.
 * @returns {string} Error message, or an empty string if valid
 */
function passwordMessage() {
  const password = passwordInput.value;
  if (!password) return "Bitte ein Passwort eingeben.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen haben.`;
  }
  return "";
}

/**
 * Validates the password confirmation field.
 * @returns {string} Error message, or an empty string if valid
 */
function confirmMessage() {
  if (!confirmInput.value) return "Bitte das Passwort bestätigen.";
  if (confirmInput.value !== passwordInput.value) {
    return "Die Passwörter stimmen nicht überein.";
  }
  return "";
}

/**
 * Sets the custom validity of all fields based on their message functions.
 * @returns {void}
 */
function validateFields() {
  nameInput.setCustomValidity(nameMessage());
  emailInput.setCustomValidity(emailMessage());
  passwordInput.setCustomValidity(passwordMessage());
  confirmInput.setCustomValidity(confirmMessage());
}

/* ---------- Error display ---------- */

/**
 * Creates the error element after the wrapper and links it via aria-describedby.
 * @param {HTMLInputElement} input - The associated input field
 * @param {Element} wrapper - Container of the input field (.signup-input)
 * @returns {HTMLParagraphElement} The newly created error element
 */
function createErrorElement(input, wrapper) {
  const error = document.createElement("p");
  error.className = "error-message";
  error.id = `${input.id}-error`;
  error.setAttribute("aria-live", "polite");
  wrapper.after(error);
  input.setAttribute("aria-describedby", error.id);
  return error;
}

/**
 * Returns the error element of a field, creating it if necessary.
 * @param {HTMLInputElement} input - The input field
 * @returns {Element} The error element
 */
function getErrorElement(input) {
  const wrapper = input.closest(".signup-input");
  const next = wrapper.nextElementSibling;
  if (next && next.classList.contains("error-message")) return next;
  return createErrorElement(input, wrapper);
}

/**
 * Shows or clears a field's error message and updates its ARIA/CSS state.
 * @param {HTMLInputElement} input - The input field
 * @param {string} message - Error message; an empty string clears the error
 * @returns {void}
 */
function setError(input, message) {
  getErrorElement(input).textContent = message;
  input.classList.toggle("input-error", Boolean(message));
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

/**
 * Renders errors for all fields; only touched fields show a message.
 * @returns {void}
 */
function renderErrors() {
  fields.forEach((field) => {
    setError(field, touched.has(field) ? field.validationMessage : "");
  });
}

/* ---------- Button & refresh ---------- */

/**
 * Enables the signup button only if the form is valid and the privacy checkbox is checked.
 * @returns {void}
 */
function updateButton() {
  signupButton.disabled = !(
    privacyCheckbox.checked && signupForm.checkValidity()
  );
}

/**
 * Validates all fields, renders errors and updates the button state.
 * @returns {void}
 */
function refresh() {
  validateFields();
  renderErrors();
  updateButton();
}

/* ---------- Events ---------- */

/**
 * Marks a field as touched and refreshes the UI.
 * @param {HTMLInputElement} field - The field that was touched
 * @returns {void}
 */
function markTouched(field) {
  touched.add(field);
  refresh();
}

/**
 * Handles form submission: marks all fields as touched, validates, and aborts on errors.
 * @param {SubmitEvent} event - The submit event
 * @returns {void}
 */
function handleSubmit(event) {
  event.preventDefault();
  fields.forEach((field) => touched.add(field));
  refresh();
  if (signupButton.disabled) return;

  // TODO: Perform signup (backend/database)
  console.log("Signup valid:", {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
  });
}

/**
 * Registers all event listeners and sets the initial state.
 * @returns {void}
 */
function init() {
  fields.forEach((field) => {
    field.addEventListener("blur", () => markTouched(field));
  });
  signupForm.addEventListener("input", refresh);
  privacyCheckbox.addEventListener("change", updateButton);
  signupForm.addEventListener("submit", handleSubmit);
  validateFields();
  updateButton();
}

init();