/** Tasks in the database. */
const TasksApi = {
    /**
     * Loads all tasks (empty lists are not stored by the database, so they are added here)
     * @returns {Promise<Task[]>}
     */
    async loadTasks() {
        const data = await firebaseRequest("tasks", "GET");
        const records = data === null ? [] : Object.values(data);
        return records.map((task) => ({ ...task, description: task.description ?? "", assignedTo: task.assignedTo ?? [], subtasks: task.subtasks ?? [] })); // spread: copy with defaults
    },

    /**
     * Saves a new or changed task
     * @param {Task} task
     * @returns {Promise<void>}
     */
    async saveTask(task) {
        await firebaseRequest("tasks/t" + task.id, "PUT", task);
    },

    /**
     * Deletes a task
     * @param {number} taskId
     * @returns {Promise<void>}
     */
    async removeTask(taskId) {
        await firebaseRequest("tasks/t" + taskId, "DELETE");
    },

    /**
     * Takes a deleted contact out of all tasks it was assigned to
     * @param {number} contactId
     * @returns {Promise<void>}
     */
    async removeContactFromTasks(contactId) {
        const tasks = await TasksApi.loadTasks();
        const affected = tasks.filter((task) => task.assignedTo.includes(contactId));
        for (const task of affected) {
            task.assignedTo = task.assignedTo.filter((id) => id !== contactId);
            await TasksApi.saveTask(task);
        }
    },
};
