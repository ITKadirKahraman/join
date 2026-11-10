/**
 * One task.
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {string} dueDate - "yyyy-mm-dd"
 * @property {string} priority - "urgent", "medium" or "low"
 * @property {string} category - "Technical Task" or "User Story"
 * @property {string} status - "todo", "inprogress", "awaitfeedback" or "done" (the board column)
 * @property {number[]} assignedTo - ids of the contacts
 * @property {{title: string, done: boolean}[]} subtasks
 */

const TasksDB = {
    /**
     * @type {Task[]}
     */
    tasks: [],

    categories: ["Technical Task", "User Story"],

    priorities: ["urgent", "medium", "low"],

    /** The four columns of the board, in order. */
    statuses: ["todo", "inprogress", "awaitfeedback", "done"],

    /** The names of the columns. */
    statusTitles: { todo: "To do", inprogress: "In progress", awaitfeedback: "Await feedback", done: "Done" },
};
