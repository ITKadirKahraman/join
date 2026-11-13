/* The subtask functions of the Add Task page. They live in their own file so that addTask.js stays under 400 lines. */

/**
 * Draws the list of subtasks. One of them can be in edit mode.
 * @param {number} [editIndex] - the index of the subtask you are editing
 */
function renderSubtasks(editIndex) {
    document.getElementById("subtaskList").innerHTML = subtasks.map((subtask, index) => {
        return index === editIndex ? TasksTemplate.subtaskEdit(index, subtask.title) : TasksTemplate.subtask(index, subtask.title);
    }).join("");
}

/** Adds the text from the input as a new subtask. An empty input adds nothing. */
function addSubtask() {
    const input = document.getElementById("subtaskInput");
    if (input.value.trim() === "") {
        return;
    }
    subtasks.push({ title: input.value.trim(), done: false });
    input.value = "";
    renderSubtasks();
}

/** Empties the subtask input. */
function clearSubtaskInput() {
    document.getElementById("subtaskInput").value = "";
    document.getElementById("subtaskInput").focus();
}

/**
 * Switches one subtask to edit mode.
 * @param {number} index
 */
function editSubtask(index) {
    renderSubtasks(index);
    document.getElementById("subtaskEditInput").focus();
}

/**
 * Saves the new title. If you leave it empty, the subtask is removed.
 * @param {number} index
 */
function saveSubtask(index) {
    const title = document.getElementById("subtaskEditInput").value.trim();
    if (title === "") {
        subtasks.splice(index, 1);
    } else {
        subtasks[index].title = title;
    }
    renderSubtasks();
}

/**
 * Removes one subtask.
 * @param {number} index
 */
function deleteSubtask(index) {
    subtasks.splice(index, 1);
    renderSubtasks();
}

/* ---------- Checking the form ---------- */
