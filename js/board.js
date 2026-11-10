/** @type {Contact[]} All contacts (for the initials on the cards) */
let contacts = [];
/** @type {string} What is typed into the search field (small letters) */
let searchText = "";
/** @type {number|null} Id of the task in the detail window, null if it is closed */
let openTaskId = null;

/**
 * Finds one task by id
 * @param {number} taskId
 * @returns {Task|undefined}
 */
function findTask(taskId) {
    return TasksDB.tasks.find((task) => task.id === taskId);
}

/**
 * The tasks that match the search (all tasks if the search is empty)
 * @returns {Task[]}
 */
function getVisibleTasks() {
    return TasksDB.tasks.filter((task) => {
        return task.title.toLowerCase().includes(searchText) || task.description.toLowerCase().includes(searchText);
    });
}

/* ---------- Drawing the board ---------- */

/**
 * Round initials of the assigned contacts (the first three, then "+2")
 * @param {Task} task
 * @returns {string}
 */
function getAvatars(task) {
    const assigned = contacts.filter((contact) => task.assignedTo.includes(contact.id));
    const shown = assigned.slice(0, 3).map(TasksTemplate.selectedAvatar).join("");
    const more = assigned.length > 3 ? TasksTemplate.moreAvatars(assigned.length - 3) : "";
    return shown + more;
}

/**
 * Draws one column (the oldest task first)
 * @param {string} status
 * @param {Task[]} visibleTasks
 */
function renderColumn(status, visibleTasks) {
    const list = document.querySelector(`.column__list[data-status="${status}"]`);
    const tasks = visibleTasks.filter((task) => task.status === status).sort((a, b) => a.id - b.id);
    if (tasks.length === 0) {
        list.innerHTML = TasksTemplate.emptyColumn(TasksDB.statusTitles[status]);
    } else {
        list.innerHTML = tasks.map((task) => TasksTemplate.card(task, getAvatars(task))).join("");
    }
}

/** Draws all four columns and the "No results" message */
function renderBoard() {
    const visibleTasks = getVisibleTasks();
    TasksDB.statuses.forEach((status) => renderColumn(status, visibleTasks));
    const noResults = searchText !== "" && visibleTasks.length === 0;
    document.getElementById("boardMessage").textContent = noResults ? "No results found" : "";
}

/* ---------- Detail window ---------- */

/** Draws the detail window of the open task */
function renderDetail() {
    const task = findTask(openTaskId);
    const assigned = contacts.filter((contact) => task.assignedTo.includes(contact.id));
    const assignedHtml = assigned.map(TasksTemplate.assignedRow).join("");
    const subtasksHtml = task.subtasks.map((subtask, index) => TasksTemplate.subtaskRow(task.id, index, subtask)).join("");
    document.getElementById("taskDetail").innerHTML = TasksTemplate.detail(task, assignedHtml, subtasksHtml);
}

/**
 * Opens the detail window of a task
 * @param {number} taskId
 */
function openTask(taskId) {
    openTaskId = taskId;
    renderDetail();
    document.getElementById("taskOverlay").hidden = false;
    document.body.classList.add("no-scroll");
}

/** Closes the detail window */
function closeTask() {
    openTaskId = null;
    document.getElementById("taskOverlay").hidden = true;
    document.body.classList.remove("no-scroll");
}

/**
 * Ticks a subtask or takes the tick away, then saves
 * @param {number} taskId
 * @param {number} index
 */
async function toggleSubtask(taskId, index) {
    const subtask = findTask(taskId).subtasks[index];
    if (subtask.done) {
        subtask.done = false;
    } else {
        subtask.done = true;
    }
    renderDetail();
    renderBoard();
    try {
        await TasksApi.saveTask(findTask(taskId));
    } catch {
        showToast("Could not save. Please try again.");
    }
}

/**
 * Deletes a task for good
 * @param {number} taskId
 */
async function deleteTask(taskId) {
    try {
        await TasksApi.removeTask(taskId);
    } catch {
        showToast("Could not delete. Please try again.");
        return;
    }
    TasksDB.tasks = TasksDB.tasks.filter((task) => task.id !== taskId);
    closeTask();
    renderBoard();
    showToast("Task deleted");
}

/* ---------- Moving tasks ---------- */

/**
 * Moves a task into another column and saves it (back to the old column if saving fails)
 * @param {number} taskId
 * @param {string} newStatus
 */
async function moveTask(taskId, newStatus) {
    const task = findTask(taskId);
    const oldStatus = task.status;
    if (!task || oldStatus === newStatus) {
        return;
    }
    task.status = newStatus;
    renderBoard();
    try {
        await TasksApi.saveTask(task);
    } catch {
        task.status = oldStatus;
        renderBoard();
        showToast("Could not move the task. Please try again.");
    }
}

/**
 * Shows or hides the "Move to" menu of a card (phones)
 * @param {number} taskId
 */
function toggleMoveMenu(taskId) {
    const menu = document.querySelector(`.card[data-id="${taskId}"] .card__moveMenu`);
    if (menu.hidden) {
        menu.hidden = false;
    } else {
        menu.hidden = true;
    }
}

/** Takes the dashed frame off all columns */
function clearDropMarks() {
    document.querySelectorAll(".column__list--over").forEach((list) => list.classList.remove("column__list--over"));
}

/**
 * Drag and drop: the card starts to move
 * @param {DragEvent} event
 */
function handleDragStart(event) {
    const card = event.target.closest(".card");
    if (!card) {
        return;
    }
    event.dataTransfer.setData("text/plain", card.dataset.id);
    card.classList.add("card--dragging");
}

/** Drag and drop: the card was dropped or the moving was stopped */
function handleDragEnd() {
    document.querySelectorAll(".card--dragging").forEach((card) => card.classList.remove("card--dragging"));
    clearDropMarks();
}

/**
 * Drag and drop: the card is over a column, which gets a dashed frame
 * @param {DragEvent} event
 */
function handleDragOver(event) {
    const list = event.target.closest(".column__list");
    if (!list) {
        return;
    }
    event.preventDefault();
    clearDropMarks();
    list.classList.add("column__list--over");
}

/**
 * Drag and drop: the card is dropped on a column
 * @param {DragEvent} event
 */
function handleDrop(event) {
    const list = event.target.closest(".column__list");
    if (!list) {
        return;
    }
    event.preventDefault();
    clearDropMarks();
    moveTask(Number(event.dataTransfer.getData("text/plain")), list.dataset.status);
}

/* ---------- Events ---------- */

/**
 * Clicks that change a task
 * @param {string} action
 * @param {DOMStringMap} data
 */
function handleTaskActions(action, data) {
    if (action === "toggle-subtask") {
        toggleSubtask(Number(data.id), Number(data.index));
    } else if (action === "delete-task") {
        deleteTask(Number(data.id));
    } else if (action === "move-task") {
        moveTask(Number(data.id), data.status);
    }
}

/**
 * Clicks that open or close something
 * @param {string} action
 * @param {DOMStringMap} data
 */
function handleShowActions(action, data) {
    if (action === "open-task") {
        openTask(Number(data.id));
    } else if (action === "close-task") {
        closeTask();
    } else if (action === "toggle-move-menu") {
        toggleMoveMenu(Number(data.id));
    }
}

/**
 * One click listener for the whole page
 * @param {MouseEvent} event
 */
function handlePageClick(event) {
    if (event.target.id === "taskOverlay") {
        closeTask();
    }
    const entry = event.target.closest("[data-action]");
    if (!entry) {
        return;
    }
    handleShowActions(entry.dataset.action, entry.dataset);
    handleTaskActions(entry.dataset.action, entry.dataset);
}

/**
 * Escape closes the detail window, Enter opens the card that has the focus
 * @param {KeyboardEvent} event
 */
function handleKeydown(event) {
    if (event.key === "Escape" && openTaskId !== null) {
        closeTask();
    } else if (event.key === "Enter" && event.target.classList.contains("card")) {
        openTask(Number(event.target.dataset.id));
    }
}

/** Loads the tasks and the contacts, then draws the board (fetch first, then render) */
async function loadBoard() {
    document.getElementById("boardMessage").textContent = "Loading tasks...";
    try {
        TasksDB.tasks = await TasksApi.loadTasks();
        contacts = await ContactsApi.loadContacts();
    } catch {
        document.getElementById("boardMessage").textContent = "The board could not be loaded. Please reload the page.";
        return;
    }
    renderBoard();
}

/** Connects the page (the only place for the listeners) */
function init() {
    document.addEventListener("click", handlePageClick);
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("dragend", handleDragEnd);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("drop", handleDrop);
    document.getElementById("search-task").addEventListener("input", (event) => {
        searchText = event.target.value.trim().toLowerCase();
        renderBoard();
    });
    loadBoard();
}

init();
