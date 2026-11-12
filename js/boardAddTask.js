/* Board: the "+" in a column and "Add task +" open Add Task in a window on top of the board, instead of jumping to the page. */

/** @type {Element|null} Whatever had the focus before the window opened, so it can get it back. */
let focusBeforeWindow = null;

/** @returns {HTMLElement} The window that holds the form */
function addTaskOverlay() {
    return document.getElementById("addTaskOverlay");
}

/**
 * Opens the Add Task window. The new task starts in the column you picked.
 * @param {string} status - "paused", "todo", "inprogress" or "awaitfeedback"
 */
function openAddTaskWindow(status) {
    focusBeforeWindow = document.activeElement;
    document.getElementById("addTaskFrame").src = `addTask.html?fenster=1&status=${encodeURIComponent(status)}`;
    addTaskOverlay().hidden = false;
}

/** Closes the window and empties the frame, so the form is blank again next time. */
function closeAddTaskWindow() {
    addTaskOverlay().hidden = true;
    document.querySelector(".addTaskOverlay__panel").style.removeProperty("--fenster-hoehe");
    document.getElementById("addTaskFrame").src = "about:blank";
    if (focusBeforeWindow) {
        focusBeforeWindow.focus();
    }
}

/** The form has loaded, so the cursor jumps into the title field. */
function focusTitleField() {
    try {
        const frame = document.getElementById("addTaskFrame");
        frame.contentWindow.focus();
        frame.contentDocument.getElementById("taskTitle")?.focus();
    } catch {
        /* the frame is empty or not reachable: nothing to focus */
    }
}

/**
 * The form talks to the board: it says "Cancel" or "close" (saved = false), or "Create Task" (saved = true).
 * @param {MessageEvent} event
 */
function handleWindowMessage(event) {
    const frame = document.getElementById("addTaskFrame");
    if (event.source !== frame.contentWindow || !event.data || event.data.type !== "addTaskWindow") {
        return;
    }
    if (event.data.size) {
        document.querySelector(".addTaskOverlay__panel").style.setProperty("--fenster-hoehe", `${event.data.size}px`);
        return;
    }
    closeAddTaskWindow();
    if (event.data.saved) {
        showToast(String(event.data.message || "Task added to board"));
        loadBoard();
    }
}

/**
 * A click on "+" or "Add task +" opens the window. A click next to the window closes it.
 * @param {MouseEvent} event
 */
function handleAddTaskClick(event) {
    if (event.target.id === "addTaskOverlay") {
        closeAddTaskWindow();
        return;
    }
    const link = event.target.closest("[data-action='add-task']");
    if (link) {
        event.preventDefault();
        openAddTaskWindow(link.dataset.status);
    }
}

/** Hooks everything up. This is the only place with listeners for the window. */
function initAddTaskWindow() {
    document.addEventListener("click", handleAddTaskClick);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !addTaskOverlay().hidden) {
            closeAddTaskWindow();
        }
    });
    window.addEventListener("message", handleWindowMessage);
    document.getElementById("addTaskFrame").addEventListener("load", focusTitleField);
}

initAddTaskWindow();
