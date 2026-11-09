/** @type {HTMLFormElement} */
const loginForm = document.getElementById("login-form");
/** @type {HTMLInputElement} */
const loginEmail = document.getElementById("email");
/** @type {HTMLInputElement} */
const loginPassword = document.getElementById("password");
/** @type {HTMLButtonElement} */
const loginButton = loginForm.querySelector('button[type="submit"]');
/** @type {HTMLElement} */
const loginError = document.getElementById("login-error");

/** @type {RegExp} Basic email format check */
const LOGIN_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Checks the two fields
 * @returns {string} Error message, or an empty string if both are filled correctly
 */
function getLoginMessage() {
    const email = loginEmail.value.trim();
    if (!email) return "Bitte eine E-Mail-Adresse eingeben.";
    if (!LOGIN_EMAIL_REGEX.test(email)) return "Bitte eine gültige E-Mail-Adresse eingeben.";
    if (!loginPassword.value) return "Bitte ein Passwort eingeben.";
    return "";
}

/**
 * Shows an error under the fields (an empty text clears it)
 * @param {string} message
 */
function showLoginError(message) {
    loginError.textContent = message;
    loginEmail.classList.toggle("input-error", Boolean(message));
    loginPassword.classList.toggle("input-error", Boolean(message));
}

/**
 * Asks the database; the button stays off while it works
 * @returns {Promise<{name: string, email: string}|null>} the account, or null if email or password is wrong
 */
async function checkLoginData() {
    loginButton.disabled = true;
    try {
        return await AuthApi.checkLogin(loginEmail.value, loginPassword.value);
    } finally {
        loginButton.disabled = false;
    }
}

/**
 * Log in with email and password
 * @param {SubmitEvent} event
 */
async function handleLoginSubmit(event) {
    event.preventDefault();
    const message = getLoginMessage();
    showLoginError(message);
    if (message) return;
    try {
        const user = await checkLoginData();
        if (user === null) return showLoginError("E-Mail oder Passwort ist falsch.");
        setSession({ type: "user", name: user.name, email: user.email });
        window.location.href = "./summary.html";
    } catch {
        showLoginError("Die Datenbank ist nicht erreichbar. Bitte später noch einmal versuchen.");
    }
}

/**
 * Guest log in: the guest uses the same board and contacts as everybody
 */
function guestLogin() {
    setSession({ type: "guest", name: "Guest", email: "" });
    window.location.href = "./summary.html";
}

/** Connects the form and the Guest Log in button */
function initLogin() {
    loginForm.addEventListener("submit", handleLoginSubmit);
    loginForm.addEventListener("input", () => showLoginError(""));
    document.getElementById("guestLoginButton").addEventListener("click", guestLogin);
}

initLogin();
