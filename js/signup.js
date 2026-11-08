const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm-password");
const privacyCheckbox = document.getElementById("privacy");
const signupButton = document.getElementById("signup-button");
const signupForm = document.getElementById("signup-form");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 8;

const fields = [nameInput, emailInput, passwordInput, confirmInput];
const touched = new Set();

/* ---------- Validierungs-Meldungen ---------- */

function nameMessage() {
  return nameInput.value.trim() ? "" : "Bitte einen Namen eingeben.";
}

function emailMessage() {
  const email = emailInput.value.trim();
  if (!email) return "Bitte eine E-Mail-Adresse eingeben.";
  if (!EMAIL_REGEX.test(email)) {
    return "Bitte eine gültige E-Mail-Adresse eingeben.";
  }
  return "";
}

function passwordMessage() {
  const password = passwordInput.value;
  if (!password) return "Bitte ein Passwort eingeben.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen haben.`;
  }
  return "";
}

function confirmMessage() {
  if (!confirmInput.value) return "Bitte das Passwort bestätigen.";
  if (confirmInput.value !== passwordInput.value) {
    return "Die Passwörter stimmen nicht überein.";
  }
  return "";
}

function validateFields() {
  nameInput.setCustomValidity(nameMessage());
  emailInput.setCustomValidity(emailMessage());
  passwordInput.setCustomValidity(passwordMessage());
  confirmInput.setCustomValidity(confirmMessage());
}

/* ---------- Fehleranzeige ---------- */

function createErrorElement(input, wrapper) {
  const error = document.createElement("p");
  error.className = "error-message";
  error.id = `${input.id}-error`;
  error.setAttribute("aria-live", "polite");
  wrapper.after(error);
  input.setAttribute("aria-describedby", error.id);
  return error;
}

function getErrorElement(input) {
  const wrapper = input.closest(".signup-input");
  const next = wrapper.nextElementSibling;
  if (next && next.classList.contains("error-message")) return next;
  return createErrorElement(input, wrapper);
}

function setError(input, message) {
  getErrorElement(input).textContent = message;
  input.classList.toggle("input-error", Boolean(message));
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

function renderErrors() {
  fields.forEach((field) => {
    setError(field, touched.has(field) ? field.validationMessage : "");
  });
}

/* ---------- Button & Refresh ---------- */

function updateButton() {
  signupButton.disabled = !(
    privacyCheckbox.checked && signupForm.checkValidity()
  );
}

function refresh() {
  validateFields();
  renderErrors();
  updateButton();
}

/* ---------- Events ---------- */

function markTouched(field) {
  touched.add(field);
  refresh();
}

function handleSubmit(event) {
  event.preventDefault();
  fields.forEach((field) => touched.add(field));
  refresh();
  if (signupButton.disabled) return;

  // TODO: Registrierung ausführen (Backend/Datenbank)
  console.log("Signup valid:", {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
  });
}

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