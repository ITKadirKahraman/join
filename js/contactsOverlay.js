/**
 * Shows the overlay, locks the page scroll, focuses the first field
 * @param {Object} config
 */
function openOverlay(config) {
    if (document.getElementById("overlay")) {
        return;
    }
    document.body.insertAdjacentHTML("beforeend", ContactsTemplate.overlay(config));
    document.body.classList.add("no-scroll");
    document.getElementById("contactName").focus();
}

/** Opens the empty "Add contact" overlay */
function openAddContact() {
    openOverlay(ContactsTemplate.addConfig());
}

/**
 * Opens the "Edit contact" overlay, filled with the contact
 * @param {number} contactId
 */
function openEditContact(contactId) {
    const contact = findContact(contactId);
    if (contact) {
        openOverlay(ContactsTemplate.editConfig(contact));
    }
}

/** Closes every overlay (also the delete question) and releases the page scroll */
function closeOverlay() {
    document.querySelectorAll(".overlay").forEach((overlay) => overlay.remove());
    document.body.classList.remove("no-scroll");
}

/**
 * A click next to the card closes it (a click inside the card does not)
 * @param {HTMLElement} backdrop
 * @param {MouseEvent} event
 */
function closeBackdrop(backdrop, event) {
    if (event.target === backdrop) {
        closeOverlay();
    }
}

/**
 * Escape closes the overlay
 * @param {KeyboardEvent} event
 */
function handleKeydown(event) {
    if (event.key === "Escape") {
        closeOverlay();
    }
}
