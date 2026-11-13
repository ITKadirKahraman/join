/** @type {Contact[]} All the contacts, loaded once */
let contacts = [];
/** @type {number[]} The ids of the contacts you picked */
let selectedContactIds = [];
/** @type {{title: string, done: boolean}[]} The subtasks */
let subtasks = [];
/** @type {string} "urgent", "medium" or "low" */
let priority = "medium";
/** @type {Task|null} The task you are editing (the page was opened with ?edit=...), or null when you are making a new one */
let editedTask = null;

/** @type {string[]} The fields you have to fill in. Each one has an error line with the id <field>-error. */
const REQUIRED_FIELDS = ["taskTitle", "taskDueDate", "taskCategory"];

/**
 * Finds out which column the new task starts in: "todo", or the one from the address (for example ?status=inprogress).
 * @returns {string}
 */
function getStartStatus() {
    const status = new URLSearchParams(window.location.search).get("status");
    return TasksDB.statuses.includes(status) ? status : "todo";
}

/* ---------- Priority ---------- */

/**
 * Marks one of the three priority buttons as the chosen one.
 * @param {string} newPriority
 */
function setPriority(newPriority) {
    priority = newPriority;
    document.querySelectorAll("[data-action='set-priority']").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.priority === priority));
    });
}

/* ---------- Assigned to ---------- */

/** Draws the menu with all the contacts from A to Z. The ones you picked are marked. */
function renderContactOptions() {
    const sorted = [...contacts].sort((a, b) => a.name.localeCompare(b.name)); // the spread makes a copy, so the original order stays as it is
    const options = sorted.map((contact) => TasksTemplate.contactOption(contact, selectedContactIds.includes(contact.id)));
    document.getElementById("contactOptions").innerHTML = options.join("");
}

/** Draws the round initials of the picked contacts below the menu. */
function renderSelectedContacts() {
    const selected = contacts.filter((contact) => selectedContactIds.includes(contact.id));
    document.getElementById("selectedContacts").innerHTML = selected.map(TasksTemplate.selectedAvatar).join("");
}

/**
 * Picks a contact, or takes the pick away again.
 * @param {number} contactId
 */
function toggleContact(contactId) {
    if (selectedContactIds.includes(contactId)) {
        selectedContactIds = selectedContactIds.filter((id) => id !== contactId);
    } else {
        selectedContactIds.push(contactId);
    }
    renderContactOptions();
    renderSelectedContacts();
}

/** Opens the contact menu. */
function openContactMenu() {
    document.getElementById("contactOptions").hidden = false;
    document.getElementById("assignToggle").setAttribute("aria-expanded", "true");
}

/** Closes the contact menu. */
function closeContactMenu() {
    document.getElementById("contactOptions").hidden = true;
    document.getElementById("assignToggle").setAttribute("aria-expanded", "false");
}

/** Opens the contact menu if it is closed, and closes it if it is open. */
function toggleContactMenu() {
    const menuIsClosed = document.getElementById("contactOptions").hidden;
    if (menuIsClosed) {
        openContactMenu();
    } else {
        closeContactMenu();
    }
}

/**
 * A click next to the menu closes it.
 * @param {MouseEvent} event
 */
function closeMenuOnOutsideClick(event) {
    if (!event.target.closest("#assignedTo")) {
        closeContactMenu();
    }
}

/**
 * Checks one required field and shows its error, or clears it.
 * @param {string} fieldId
 * @returns {boolean} true if the field is filled in
 */
function checkRequired(fieldId) {
    const field = document.getElementById(fieldId);
    const isEmpty = field.value.trim() === "";
    document.getElementById(fieldId + "-error").textContent = isEmpty ? "This field is required" : "";
    field.classList.toggle("input-error", isEmpty);
    return !isEmpty;
}

/**
 * Checks all required fields and shows every error at once.
 * @returns {boolean}
 */
function checkForm() {
    return REQUIRED_FIELDS.map(checkRequired).every((isFilled) => isFilled);
}

/** Checks the fields that show an error once more, so the error disappears as soon as you fix it. */
function refreshShownErrors() {
    REQUIRED_FIELDS.forEach((fieldId) => {
        if (document.getElementById(fieldId).classList.contains("input-error")) {
            checkRequired(fieldId);
        }
    });
}

/* ---------- Saving ---------- */

/**
 * Builds the new task from what is in the form.
 * @returns {Task}
 */
function buildTask() {
    return {
        id: editedTask ? editedTask.id : Date.now(),
        title: document.getElementById("taskTitle").value.trim(),
        description: document.getElementById("taskDescription").value.trim(),
        dueDate: document.getElementById("taskDueDate").value,
        priority,
        category: document.getElementById("taskCategory").value,
        status: editedTask ? editedTask.status : getStartStatus(),
        assignedTo: [...selectedContactIds], // spread: copy
        subtasks: subtasks.map((subtask) => ({ title: subtask.title, done: subtask.done })),
    };
}

/**
 * Create Task: check the form, save, tell the user and go to the board.
 * @param {SubmitEvent} event
 */
async function handleSubmit(event) {
    event.preventDefault();
    if (!checkForm()) {
        return;
    }
    const createButton = document.getElementById("createButton");
    createButton.disabled = true;
    try {
        await TasksApi.saveTask(buildTask());
        const message = editedTask ? "Task saved" : "Task added to board";
        if (isWindowMode()) {
            closeWindow(true, message);
            return;
        }
        showToast(message);
        setTimeout(() => { window.location.href = "./board.html"; }, 1500);
    } catch {
        document.getElementById("form-error").textContent = "The task could not be saved. Please try again.";
        createButton.disabled = false;
    }
}

/** Clear: back to an empty form. */
function clearForm() {
    document.getElementById("addTaskForm").reset();
    REQUIRED_FIELDS.forEach((fieldId) => {
        document.getElementById(fieldId + "-error").textContent = "";
        document.getElementById(fieldId).classList.remove("input-error");
    });
    document.getElementById("form-error").textContent = "";
    selectedContactIds = [];
    subtasks = [];
    setPriority("medium");
    renderContactOptions();
    renderSelectedContacts();
    renderSubtasks();
}

/* ---------- Events ---------- */

/**
 * Handles the clicks on priority and contacts.
 * @param {string} action
 * @param {DOMStringMap} data
 */
function handleContactActions(action, data) {
    if (action === "set-priority") {
        setPriority(data.priority);
    } else if (action === "toggle-contact-menu") {
        toggleContactMenu();
    } else if (action === "toggle-contact") {
        toggleContact(Number(data.id));
    }
}

/**
 * Handles the clicks on the subtasks.
 * @param {string} action
 * @param {DOMStringMap} data
 */
function handleSubtaskActions(action, data) {
    if (action === "focus-subtask") {
        document.getElementById("subtaskInput").focus();
    } else if (action === "add-subtask") {
        addSubtask();
    } else if (action === "clear-subtask-input") {
        clearSubtaskInput();
    } else if (action === "edit-subtask") {
        editSubtask(Number(data.index));
    } else if (action === "save-subtask") {
        saveSubtask(Number(data.index));
    } else if (action === "delete-subtask") {
        deleteSubtask(Number(data.index));
    }
}

/**
 * One click listener for the whole page.
 * @param {MouseEvent} event
 */
function handlePageClick(event) {
    closeMenuOnOutsideClick(event);
    const entry = event.target.closest("[data-action]");
    if (!entry) {
        return;
    }
    handleContactActions(entry.dataset.action, entry.dataset);
    handleSubtaskActions(entry.dataset.action, entry.dataset);
}

/**
 * Enter in a subtask field saves the subtask and never the whole task.
 * @param {KeyboardEvent} event
 */
function handleKeydown(event) {
    if (event.key === "Escape" && isWindowMode()) {
        cancelWindow();
    }
    if (event.key !== "Enter") {
        return;
    }
    if (event.target.id === "subtaskInput") {
        event.preventDefault();
        addSubtask();
    } else if (event.target.id === "subtaskEditInput") {
        event.preventDefault();
        document.querySelector("[data-action='save-subtask']").click();
    }
}

/* ---------- Changing a task ---------- */

/** Edit mode: the page says "Edit Task", the button says "Save" and there is no Clear. */
function showEditMode() {
    document.getElementById("pageTitle").textContent = "Edit Task";
    document.getElementById("createLabel").textContent = "Save";
    document.getElementById("clearButton").hidden = true;
}

/**
 * Puts the values of a task into the form.
 * @param {Task} task
 */
function fillForm(task) {
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDescription").value = task.description;
    document.getElementById("taskDueDate").value = task.dueDate;
    document.getElementById("taskCategory").value = task.category;
    setPriority(task.priority);
    selectedContactIds = [...task.assignedTo]; // the spread makes a copy
    subtasks = task.subtasks.map((subtask) => ({ title: subtask.title, done: subtask.done }));
    renderContactOptions();
    renderSelectedContacts();
    renderSubtasks();
}

/**
 * Loads the task you are editing and fills the form with it.
 * @param {number} taskId
 */
async function loadTaskToEdit(taskId) {
    try {
        const tasks = await TasksApi.loadTasks();
        editedTask = tasks.find((task) => task.id === taskId) ?? null;
    } catch {
        editedTask = null;
    }
    if (editedTask === null) {
        document.getElementById("form-error").textContent = "This task could not be loaded.";
        return;
    }
    showEditMode();
    fillForm(editedTask);
}

/** Loads the contacts first, then the task if the page was opened to edit one. The contacts are needed to fill in the form. */
async function loadPage() {
    await loadContacts();
    const editId = new URLSearchParams(window.location.search).get("edit");
    if (editId !== null) {
        await loadTaskToEdit(Number(editId));
    }
}

/** Loads the contacts for the "Assigned to" menu. */
async function loadContacts() {
    try {
        contacts = await ContactsApi.loadContacts();
    } catch {
        document.getElementById("contactOptions").innerHTML = "<li class='assign__message'>Contacts could not be loaded.</li>";
        return;
    }
    renderContactOptions();
}

/** Hooks the page up. This is the only place with listeners. */
function init() {
    document.addEventListener("click", handlePageClick);
    document.addEventListener("keydown", handleKeydown);
    REQUIRED_FIELDS.forEach((fieldId) => {
        document.getElementById(fieldId).addEventListener("blur", () => checkRequired(fieldId));
    });
    document.getElementById("addTaskForm").addEventListener("input", refreshShownErrors);
    document.getElementById("addTaskForm").addEventListener("submit", handleSubmit);
    if (isWindowMode()) {
        prepareWindowMode();
    }
    document.getElementById("clearButton").addEventListener("click", isWindowMode() ? cancelWindow : clearForm);
    loadPage();
}

init();
