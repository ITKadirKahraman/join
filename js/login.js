/**
 * Guest log in: remembers the guest for this browser tab and opens the summary
 */
function guestLogin() {
    sessionStorage.setItem("joinUser", "guest");
    window.location.href = "./summary.html";
}

/** Connects the Guest Log in button */
function initLogin() {
    document.getElementById("guestLoginButton").addEventListener("click", guestLogin);
}

initLogin();
