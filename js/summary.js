/**
 * How many tasks are in one column
 * @param {Task[]} tasks
 * @param {string} status
 * @returns {number}
 */
function countStatus(tasks, status) {
    return tasks.filter((task) => task.status === status).length;
}

/**
 * The urgent tasks that are not done yet
 * @param {Task[]} tasks
 * @returns {Task[]}
 */
function getUrgentTasks(tasks) {
    return tasks.filter((task) => task.priority === "urgent" && task.status !== "done");
}

/**
 * The nearest due date of a list of tasks, written like "October 16, 2022" (a dash if there is none)
 * @param {Task[]} tasks
 * @returns {string}
 */
function getNextDeadline(tasks) {
    if (tasks.length === 0) {
        return "–";
    }
    const dates = tasks.map((task) => task.dueDate).sort();
    const date = new Date(dates[0] + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/**
 * Greeting for the time of day
 * @param {number} hour - 0 to 23
 * @returns {string}
 */
function getGreeting(hour) {
    if (hour < 12) {
        return "Good morning";
    }
    if (hour < 18) {
        return "Good afternoon";
    }
    return "Good evening";
}

/** Writes the greeting; a guest gets "Good morning!" without a name */
function showGreeting() {
    const session = getSession();
    const greeting = getGreeting(new Date().getHours());
    const knowsName = session !== null && session.type !== "guest";
    document.getElementById("greeting").textContent = knowsName ? greeting + "," : greeting + "!";
    document.getElementById("greetingName").textContent = knowsName ? session.name : "";
}

/**
 * Writes the numbers into the tiles
 * @param {Task[]} tasks
 */
function showNumbers(tasks) {
    const urgentTasks = getUrgentTasks(tasks);
    document.getElementById("countTodo").textContent = countStatus(tasks, "todo");
    document.getElementById("countDone").textContent = countStatus(tasks, "done");
    document.getElementById("countUrgent").textContent = urgentTasks.length;
    document.getElementById("deadline").textContent = getNextDeadline(urgentTasks);
    document.getElementById("countBoard").textContent = tasks.length;
    document.getElementById("countInProgress").textContent = countStatus(tasks, "inprogress");
    document.getElementById("countAwaiting").textContent = countStatus(tasks, "awaitfeedback");
}

/** Loads the tasks, then writes the numbers (fetch first, then render) */
async function loadSummary() {
    try {
        showNumbers(await TasksApi.loadTasks());
    } catch {
        document.getElementById("summaryMessage").textContent = "The numbers could not be loaded. Please reload the page.";
    }
}

/** Called once on load */
function init() {
    showGreeting();
    loadSummary();
}

init();
