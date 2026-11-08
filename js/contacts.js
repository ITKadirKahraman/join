/**
 * Finds one contact by id
 * @param {number} contactId
 * @returns {Contact|undefined}
 */
function findContact(contactId) {
    return ContactsDB.contacts.find((contact) => contact.id === contactId);
}

/**
 * Sorts by name (A to Z) without changing the original list
 * @param {Contact[]} contacts
 * @returns {Contact[]}
 */
function sortContacts(contacts) {
    const sortedContacts = [...contacts]; // spread: copy
    return sortedContacts.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Groups sorted contacts by first letter: { A: [...], B: [...] }
 * @param {Contact[]} sortedContacts
 * @returns {Object<string, Contact[]>}
 */
function groupByLetter(sortedContacts) {
    const groups = {};
    sortedContacts.forEach((contact) => {
        const letter = contact.name.charAt(0).toUpperCase();
        if (!groups[letter]) {
            groups[letter] = [];
        }
        groups[letter].push(contact);
    });
    return groups;
}

/** Draws the whole list (needed after adding, changing or deleting, because order and groups can change) */
function renderContactList() {
    const groups = groupByLetter(sortContacts(ContactsDB.contacts));
    let listHtml = "";
    Object.keys(groups).forEach((letter) => {
        const contactsHtml = groups[letter].map(ContactsTemplate.contact).join("");
        listHtml += ContactsTemplate.group(letter, contactsHtml);
    });
    document.getElementById("contactList").innerHTML = listHtml;
}

/** Removes the "selected" look from every list entry */
function clearSelectedContact() {
    document.querySelectorAll(".contact").forEach((entry) => {
        entry.classList.remove("contact--selected");
        entry.setAttribute("aria-pressed", "false");
    });
}

/**
 * Marks one list entry as selected (and no other)
 * @param {number} contactId
 */
function markSelectedContact(contactId) {
    clearSelectedContact();
    const entry = document.querySelector(`.contact[data-id="${contactId}"]`);
    if (entry) {
        entry.classList.add("contact--selected");
        entry.setAttribute("aria-pressed", "true");
        entry.scrollIntoView({ block: "nearest" });
    }
}

/**
 * Shows the details of one contact on the right (on phones: as its own screen)
 * @param {number} contactId
 */
function showContact(contactId) {
    const contact = findContact(contactId);
    if (!contact) {
        return;
    }
    document.getElementById("contactDetail").innerHTML = ContactsTemplate.detail(contact);
    markSelectedContact(contactId);
    document.querySelector(".contacts").classList.add("contacts--detail-open");
}

/** Empties the detail view (phones: back to the list) and clears the selection */
function hideDetail() {
    document.querySelector(".contacts").classList.remove("contacts--detail-open");
    document.getElementById("contactDetail").innerHTML = "";
    clearSelectedContact();
}

/**
 * Clicks that show, add or leave a contact
 * @param {string} action
 * @param {number} contactId
 */
function handleShowActions(action, contactId) {
    if (action === "select-contact") {
        showContact(contactId);
    } else if (action === "open-add-contact") {
        openAddContact();
    } else if (action === "close-detail") {
        hideDetail();
    } else if (action === "retry-load") {
        loadContactList();
    }
}

/**
 * Clicks that change a contact (edit window, delete question)
 * @param {string} action
 * @param {number} contactId
 */
function handleChangeActions(action, contactId) {
    if (action === "edit-contact") {
        openEditContact(contactId);
    } else if (action === "delete-contact") {
        openDeleteConfirm(contactId);
    } else if (action === "confirm-delete") {
        deleteContact(contactId);
    }
}

/**
 * Clicks that close a window
 * @param {string} action
 * @param {HTMLElement} entry
 * @param {MouseEvent} event
 */
function handleCloseActions(action, entry, event) {
    if (action === "close-overlay") {
        closeOverlay();
    } else if (action === "close-confirm") {
        closeConfirm();
    } else if (action === "close-backdrop") {
        closeBackdrop(entry, event);
    }
}

/**
 * One click listener for the whole page
 * @param {MouseEvent} event
 */
function handlePageClick(event) {
    const entry = event.target.closest("[data-action]");
    if (!entry) {
        return;
    }
    const action = entry.dataset.action;
    const contactId = Number(entry.dataset.id);
    handleShowActions(action, contactId);
    handleChangeActions(action, contactId);
    handleCloseActions(action, entry, event);
}

/**
 * Switches the "Add new contact" button on or off (it is off while contacts are loading)
 * @param {boolean} isDisabled
 */
function setAddButtonDisabled(isDisabled) {
    document.getElementById("addContactButton").disabled = isDisabled;
}

/** Loads the contacts, then draws the list (fetch first, then render) */
async function loadContactList() {
    const listElement = document.getElementById("contactList");
    listElement.innerHTML = ContactsTemplate.status("Loading contacts...");
    setAddButtonDisabled(true);
    try {
        ContactsDB.contacts = await ContactsApi.loadContacts();
    } catch {
        listElement.innerHTML = ContactsTemplate.loadError();
        return;
    }
    renderContactList();
    setAddButtonDisabled(false);
}

/** Registers all event listeners (the only place for them) */
function registerListeners() {
    document.addEventListener("click", handlePageClick);
    document.addEventListener("submit", handleFormSubmit);
    document.addEventListener("keydown", handleKeydown);
}

/** Called once on load */
function init() {
    registerListeners();
    loadContactList();
}

init();
