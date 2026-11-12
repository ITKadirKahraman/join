/* Add Task as a window: the same page, shown in a window on top of the board (the address ends with ?fenster=1). */

/**
 * Checks if the page is shown inside the window on the board.
 * @returns {boolean}
 */
function isWindowMode() {
    return new URLSearchParams(window.location.search).get("fenster") === "1";
}

/**
 * Tells the board to close this window. If a task was saved, the board also reloads its tasks.
 * @param {boolean} saved
 * @param {string} [message] - the little message the board shows after saving
 */
function closeWindow(saved, message) {
    window.parent.postMessage({ type: "addTaskWindow", saved, message }, "*");
}

/** Tells the board how tall the form is, so the window fits its content (but never gets taller than the screen). */
function reportWindowSize() {
    const height = Math.ceil(document.querySelector("main.addTask").getBoundingClientRect().height);
    window.parent.postMessage({ type: "addTaskWindow", size: height }, "*");
}

/** Cancel: closes the window and saves nothing. */
function cancelWindow() {
    closeWindow(false);
}

/** Gives the page its window look: "Clear" turns into "Cancel" and the close button starts working. */
function prepareWindowMode() {
    document.documentElement.classList.add("fenster");
    document.getElementById("clearButton").firstChild.textContent = "Cancel ";
    document.getElementById("closeWindow").addEventListener("click", cancelWindow);
    new ResizeObserver(reportWindowSize).observe(document.querySelector("main.addTask"));
}
