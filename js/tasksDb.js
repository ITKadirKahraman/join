/**
 * One task on the board.
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {string} dueDate - "yyyy-mm-dd"
 * @property {string} priority - "urgent", "medium" or "low"
 * @property {string} category - "Technical Task" or "User Story"
 * @property {string} status - the board column: "paused", "todo", "inprogress", "awaitfeedback" or "done"
 * @property {number[]} assignedTo - the ids of the contacts
 * @property {{title: string, done: boolean}[]} subtasks
 */

const TasksDB = {
    /**
     * @type {Task[]}
     */
    tasks: [],

    categories: ["Technical Task", "User Story"],

    priorities: ["urgent", "medium", "low"],

    /** The five columns of the board, from left to right. */
    statuses: ["paused", "todo", "inprogress", "awaitfeedback", "done"],

    /** The names you see above the columns. */
    statusTitles: { paused: "Paused", todo: "To do", inprogress: "In progress", awaitfeedback: "Await feedback", done: "Done" },
};
