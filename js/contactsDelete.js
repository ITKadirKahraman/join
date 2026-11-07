/**
 * Shows the question
 * @param {number} contactId
 */
function openDeleteConfirm(contactId) {
    const contact = findContact(contactId);
    if (!contact || document.getElementById("confirmOverlay")) {
        return;
    }
    document.body.insertAdjacentHTML("beforeend", ContactsTemplate.confirm(contact));
    document.body.classList.add("no-scroll");
}

/** Closes only the question */
function closeConfirm() {
    const confirmOverlay = document.getElementById("confirmOverlay");
    if (confirmOverlay) {
        confirmOverlay.remove();
    }
    if (!document.getElementById("overlay")) {
        document.body.classList.remove("no-scroll");
    }
}

/**
 * Removes the contact from the local list
 * @param {number} contactId
 */
function removeStoredContact(contactId) {
    const position = ContactsDB.contacts.findIndex((entry) => entry.id === contactId);
    if (position !== -1) {
        ContactsDB.contacts.splice(position, 1);
    }
}

/**
 * Switches the red "Delete" button of the question on or off (no double click while the database works)
 * @param {boolean} isBusy
 */
function setDeleteButtonBusy(isBusy) {
    document.querySelector('[data-action="confirm-delete"]').disabled = isBusy;
}

/**
 * Removes the contact from the page after a successful delete
 * @param {number} contactId
 */
function finishDelete(contactId) {
    removeStoredContact(contactId);
    closeOverlay();
    renderContactList();
    hideDetail();
    showToast("Contact deleted");
}

/**
 * Deletes in the database first
 * @param {number} contactId
 */
async function deleteContact(contactId) {
    setDeleteButtonBusy(true);
    try {
        await ContactsApi.removeContact(contactId);
        finishDelete(contactId);
    } catch {
        setDeleteButtonBusy(false);
        showToast("Could not delete. Please try again.");
    }
}
