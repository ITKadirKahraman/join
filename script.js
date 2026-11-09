/**
 * General script for every page: who is logged in, protection of the pages, profile menu with Log out.
 * Loaded in the <head> without "defer" on purpose: the protection must redirect before the page is shown.
 */

/** Key of the logged-in user in the browser tab (gone when the tab is closed) */
const SESSION_KEY = "joinUser";

/** Pages that need a login. Legal notice, privacy policy and help stay open for everybody. */
const PROTECTED_PAGES = ["summary.html", "addTask.html", "board.html", "contacts.html"];

/**
 * Who is logged in?
 * @returns {{type: string, name: string, email: string}|null} null if nobody is logged in
 */
function getSession() {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored === "guest") {
        return { type: "guest", name: "Guest", email: "" };
    }
    try {
        const session = JSON.parse(stored);
        return session && typeof session.name === "string" ? session : null;
    } catch {
        return null;
    }
}

/**
 * Remembers the logged-in user for this browser tab
 * @param {{type: string, name: string, email: string}} session
 */
function setSession(session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** Forgets the logged-in user */
function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Sends visitors without a login from a protected page to the login page
 * @returns {boolean} true if the visitor was sent away
 */
function guardPage() {
    const page = window.location.pathname.split("/").pop();
    if (PROTECTED_PAGES.includes(page) && getSession() === null) {
        window.location.replace("login.html");
        return true;
    }
    return false;
}

/**
 * Initials of a name for the round button (first letter of the first and the last word)
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
        return "G";
    }
    const last = words.length > 1 ? words[words.length - 1] : "";
    return (words[0].charAt(0) + last.charAt(0)).toUpperCase();
}

/** Closes all profile menus (the page has one in the normal header and one in the phone header) */
function closeProfileMenus() {
    document.querySelectorAll(".profileMenu").forEach((menu) => { menu.hidden = true; });
    document.querySelectorAll(".profileButton").forEach((button) => button.setAttribute("aria-expanded", "false"));
}

/**
 * Opens the menu of this button if it is closed and the other way round
 * @param {HTMLElement} button
 */
function toggleProfileMenu(button) {
    const menu = button.parentElement.querySelector(".profileMenu");
    const menuWasOpen = !menu.hidden;
    closeProfileMenus();
    if (!menuWasOpen) {
        menu.hidden = false;
        button.setAttribute("aria-expanded", "true");
    }
}

/** Ends the login and goes to the login page */
function logout() {
    clearSession();
    window.location.replace("login.html");
}

/**
 * Closes the menus on a click beside them
 * @param {Event} event
 */
function handleMenuClose(event) {
    if (!event.target.closest(".circle")) {
        closeProfileMenus();
    }
}

/**
 * Fills the round buttons with the initials and connects the menus (pages without login see no button)
 * @param {{name: string}|null} session
 */
function initProfile(session) {
    const buttons = document.querySelectorAll(".profileButton");
    if (session === null) {
        buttons.forEach((button) => { button.hidden = true; });
        return;
    }
    document.querySelectorAll(".nameKuerzel").forEach((circle) => { circle.textContent = getInitials(session.name); });
    buttons.forEach((button) => button.addEventListener("click", () => toggleProfileMenu(button)));
    document.querySelectorAll(".logoutButton").forEach((button) => button.addEventListener("click", logout));
    document.addEventListener("click", handleMenuClose);
}

/** Marks the menu item of the page that is open (it gets a dark background) */
function markCurrentMenuItem() {
    const page = window.location.pathname.split("/").pop();
    document.querySelectorAll(".menuItems").forEach((item) => {
        const isCurrent = item.getAttribute("href").split("/").pop() === page;
        if (isCurrent) {
            item.setAttribute("aria-current", "page");
        }
    });
}

/** Starts the header of a page (only pages that have the profile button) */
function initHeader() {
    markCurrentMenuItem();
    if (document.querySelector(".profileButton")) {
        initProfile(getSession());
    }
}

/**
 * Shows a short message at the bottom (toast) for 2.5 seconds
 * @param {string} text
 */
function showToast(text) {
    const toast = document.createElement("p");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

guardPage();
window.addEventListener("pageshow", guardPage);
document.addEventListener("DOMContentLoaded", initHeader);
