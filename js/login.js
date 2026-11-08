/**
 * Guest login: remembers the guest for this browser tab and opens the summary page.
 * @returns {void}
 */
function guestLogin() {
    sessionStorage.setItem("joinUser", "guest");
    window.location.href = "./summary.html";
}

/**
 * Connects the guest login button to its click handler.
 * @returns {void}
 */
function initLogin() {
    document.getElementById("guestLoginButton").addEventListener("click", guestLogin);
}

initLogin();