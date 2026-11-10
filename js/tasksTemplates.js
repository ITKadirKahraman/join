const TasksTemplate = {
    /**
     * One contact in the "Assigned to" menu.
     * @param {Contact} contact
     * @param {boolean} isSelected
     * @returns {string}
     */
    contactOption(contact, isSelected) {
        const t = ContactsTemplate;
        return `
            <li>
                <button type="button" class="assign__option" data-action="toggle-contact" data-id="${contact.id}" aria-pressed="${isSelected}">
                    <span class="taskAvatar contact__avatar--${contact.color}" aria-hidden="true">${t.safeInitials(contact.name)}</span>
                    <span class="assign__name">${t.escapeHtml(contact.name)}</span>
                    <span class="assign__box" aria-hidden="true"></span>
                </button>
            </li>`;
    },

    /**
     * Round initials of a selected contact (below the menu).
     * @param {Contact} contact
     * @returns {string}
     */
    selectedAvatar(contact) {
        const t = ContactsTemplate;
        return `<span class="taskAvatar contact__avatar--${contact.color}" title="${t.escapeHtml(contact.name)}">${t.safeInitials(contact.name)}</span>`;
    },

    /**
     * One subtask in the list.
     * @param {number} index
     * @param {string} title
     * @returns {string}
     */
    subtask(index, title) {
        return `
            <li class="subtaskList__item">
                <span class="subtaskList__title">${ContactsTemplate.escapeHtml(title)}</span>
                <span class="subtaskList__actions">
                    <button type="button" data-action="edit-subtask" data-index="${index}" aria-label="Edit subtask"><img src="../assets/icons/edit.svg" alt=""></button>
                    <button type="button" data-action="delete-subtask" data-index="${index}" aria-label="Delete subtask"><img src="../assets/icons/delete.svg" alt=""></button>
                </span>
            </li>`;
    },

    /**
     * One subtask while it is being changed.
     * @param {number} index
     * @param {string} title
     * @returns {string}
     */
    subtaskEdit(index, title) {
        return `
            <li class="subtaskList__item subtaskList__item--edit">
                <input type="text" class="subtaskList__input" id="subtaskEditInput" value="${ContactsTemplate.escapeHtml(title)}" aria-label="Subtask">
                <span class="subtaskList__actions subtaskList__actions--visible">
                    <button type="button" data-action="delete-subtask" data-index="${index}" aria-label="Delete subtask"><img src="../assets/icons/delete.svg" alt=""></button>
                    <button type="button" class="subtaskList__confirm" data-action="save-subtask" data-index="${index}" aria-label="Save subtask"><img src="../assets/icons/check.svg" alt=""></button>
                </span>
            </li>`;
    },

    /**
     * Class for the colour of a category label.
     * @param {string} category
     * @returns {string}
     */
    categoryClass(category) {
        if (category === "User Story") {
            return "userStory";
        }
        return "technicalTask";
    },

    /**
     * Symbol of a priority (placeholder until the icons are in assets/icons).
     * @param {string} priority
     * @returns {string}
     */
    prioritySymbol(priority) {
        const symbols = { urgent: "▲▲", medium: "=", low: "▼▼" };
        return symbols[priority];
    },

    /**
     * Date as day/month/year.
     * @param {string} date - "yyyy-mm-dd"
     * @returns {string}
     */
    formatDate(date) {
        return date.split("-").reverse().join("/");
    },

    /**
     * Progress of the subtasks ("1/2 Subtasks"), nothing if there are none.
     * @param {Task} task
     * @returns {string}
     */
    progress(task) {
        if (task.subtasks.length === 0) {
            return "";
        }
        const done = task.subtasks.filter((subtask) => subtask.done).length;
        return `
            <div class="card__progress">
                <progress class="card__bar" value="${done}" max="${task.subtasks.length}"></progress>
                <span>${done}/${task.subtasks.length} Subtasks</span>
            </div>`;
    },

    /**
     * Menu to move a task to the neighbour columns (for phones, where there is no drag and drop).
     * @param {Task} task
     * @returns {string}
     */
    moveMenu(task) {
        const index = TasksDB.statuses.indexOf(task.status);
        const targets = [TasksDB.statuses[index - 1], TasksDB.statuses[index + 1]].filter((status) => status);
        const buttons = targets.map((status) => `<button type="button" data-action="move-task" data-id="${task.id}" data-status="${status}">${TasksDB.statusTitles[status]}</button>`);
        return `<div class="card__moveMenu" data-action="keep-menu" hidden><p>Move to</p>${buttons.join("")}</div>`;
    },

    /**
     * One card on the board.
     * @param {Task} task
     * @param {string} avatarsHtml
     * @returns {string}
     */
    card(task, avatarsHtml) {
        const t = TasksTemplate;
        const safe = ContactsTemplate.escapeHtml;
        return `
            <li>
                <article class="card" draggable="true" data-action="open-task" data-id="${task.id}" tabindex="0">
                    <div class="card__top">
                        <span class="card__tag card__tag--${t.categoryClass(task.category)}">${task.category}</span>
                        <button type="button" class="card__move" data-action="toggle-move-menu" data-id="${task.id}" aria-label="Move task">⇅</button>
                    </div>
                    <h3 class="card__title">${safe(task.title)}</h3>
                    <p class="card__text">${safe(task.description)}</p>
                    ${t.progress(task)}
                    <div class="card__footer">
                        <span class="card__avatars">${avatarsHtml}</span>
                        <span class="card__priority card__priority--${task.priority}" title="Priority: ${task.priority}">${t.prioritySymbol(task.priority)}</span>
                    </div>
                    ${t.moveMenu(task)}
                </article>
            </li>`;
    },

    /**
     * Grey box for an empty column.
     * @param {string} title - name of the column
     * @returns {string}
     */
    emptyColumn(title) {
        return `<li class="column__empty">No tasks ${ContactsTemplate.escapeHtml(title)}</li>`;
    },

    /**
     * "+3" after the first round initials.
     * @param {number} count
     * @returns {string}
     */
    moreAvatars(count) {
        return `<span class="taskAvatar taskAvatar--more">+${count}</span>`;
    },

    /**
     * One assigned contact in the detail window.
     * @param {Contact} contact
     * @returns {string}
     */
    assignedRow(contact) {
        const t = ContactsTemplate;
        return `
            <li class="detail__person">
                <span class="taskAvatar contact__avatar--${contact.color}" aria-hidden="true">${t.safeInitials(contact.name)}</span>
                <span>${t.escapeHtml(contact.name)}</span>
            </li>`;
    },

    /**
     * One subtask in the detail window (a click ticks it or takes the tick away).
     * @param {number} taskId
     * @param {number} index
     * @param {{title: string, done: boolean}} subtask
     * @returns {string}
     */
    subtaskRow(taskId, index, subtask) {
        return `
            <li>
                <button type="button" class="detail__subtask" data-action="toggle-subtask" data-id="${taskId}" data-index="${index}" aria-pressed="${subtask.done}">
                    <span class="detail__box" aria-hidden="true"></span>
                    <span>${ContactsTemplate.escapeHtml(subtask.title)}</span>
                </button>
            </li>`;
    },

    /**
     * The window with all details of a task.
     * @param {Task} task
     * @param {string} assignedHtml
     * @param {string} subtasksHtml
     * @returns {string}
     */
    detail(task, assignedHtml, subtasksHtml) {
        const t = TasksTemplate;
        const safe = ContactsTemplate.escapeHtml;
        return `
            <div class="detail__top">
                <span class="card__tag card__tag--${t.categoryClass(task.category)}">${task.category}</span>
                <button type="button" class="detail__close" data-action="close-task" aria-label="Close"><img src="../assets/icons/close.svg" alt=""></button>
            </div>
            <h2 class="detail__title" id="taskDetailTitle">${safe(task.title)}</h2>
            <p class="detail__text">${safe(task.description)}</p>
            <dl class="detail__facts">
                <dt>Due date:</dt><dd>${t.formatDate(task.dueDate)}</dd>
                <dt>Priority:</dt><dd>${task.priority} <span class="card__priority--${task.priority}" aria-hidden="true">${t.prioritySymbol(task.priority)}</span></dd>
            </dl>
            <h3 class="detail__heading">Assigned To:</h3>
            <ul class="detail__list">${assignedHtml}</ul>
            <h3 class="detail__heading">Subtasks</h3>
            <ul class="detail__list">${subtasksHtml}</ul>
            <div class="detail__buttons">
                <button type="button" class="detail__button" data-action="delete-task" data-id="${task.id}"><img src="../assets/icons/delete.svg" alt="">Delete</button>
                <a class="detail__button" href="addTask.html?edit=${task.id}"><img src="../assets/icons/edit.svg" alt="">Edit</a>
            </div>`;
    },
};
