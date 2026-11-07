/**
 * @param {string} name
 * @returns {string}
 */
function getNameError(name) {
    if (name.trim().length < 2) {
        return "Please enter a name (at least 2 characters).";
    }
    return "";
}

/**
 * @param {string} email
 * @returns {string}
 */
function getEmailError(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailPattern.test(email.trim())) {
        return "Please enter a valid email, e.g. name@mail.com.";
    }
    return "";
}

/**
 * @param {string} phone
 * @returns {string}
 */
function getPhoneError(phone) {
    const phonePattern = /^\+?[0-9 ()\/-]{6,20}$/;
    if (!phonePattern.test(phone.trim())) {
        return "Please enter a valid phone number, e.g. +49 1111 111 11 1.";
    }
    return "";
}

/**
 * Shows or clears the error under one field
 * @param {string} fieldId
 * @param {string} errorText
 */
function showFieldError(fieldId, errorText) {
    document.getElementById(fieldId + "Error").textContent = errorText;
    document.getElementById(fieldId).setAttribute("aria-invalid", String(errorText !== ""));
}

/**
 * Checks all fields, shows every error at once
 * @param {{name: string, email: string, phone: string}} values
 * @returns {boolean}
 */
function validateContactForm(values) {
    const nameError = getNameError(values.name);
    const emailError = getEmailError(values.email);
    const phoneError = getPhoneError(values.phone);
    showFieldError("contactName", nameError);
    showFieldError("contactEmail", emailError);
    showFieldError("contactPhone", phoneError);
    return nameError === "" && emailError === "" && phoneError === "";
}
/**
 * A new contact from the form values
 * @param {{name: string, email: string, phone: string}} values
 * @returns {Contact}
 */
function buildNewContact(values) {
    const id = Date.now();
    const color = ContactsDB.avatarColors[id % ContactsDB.avatarColors.length];
    return { id, name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim(), color };
}

/**
 * The existing contact with the changed values (the id and the color stay)
 * @param {number} contactId
 * @param {{name: string, email: string, phone: string}} values
 * @returns {Contact}
 */
function buildChangedContact(contactId, values) {
    const contact = findContact(contactId);
    return { id: contact.id, name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim(), color: contact.color };
}

/**
 * Puts the contact into the local list (replaces the old one or adds a new one)
 * @param {Contact} contact
 */
function storeContact(contact) {
    const position = ContactsDB.contacts.findIndex((entry) => entry.id === contact.id);
    if (position === -1) {
        ContactsDB.contacts.push(contact);
    } else {
        ContactsDB.contacts[position] = contact;
    }
}
/**
 * Small message at the bottom, disappears after 2.5 seconds
 * @param {string} text
 */
function showToast(text) {
    const toast = document.createElement("p");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

/**
 * After saving: close, redraw the list, show the contact, tell the user
 * @param {number} contactId
 * @param {string} message
 */
function finishSave(contactId, message) {
    closeOverlay();
    renderContactList();
    showContact(contactId);
    showToast(message);
}

/**
 * Reads the three fields of the form
 * @param {HTMLFormElement} form
 * @returns {{name: string, email: string, phone: string}
 */
function readFormValues(form) {
    return { name: form.contactName.value, email: form.contactEmail.value, phone: form.contactPhone.value };
}

/**
 * Switches the save button off while the database is working (no double clicks)
 * @param {HTMLFormElement} form
 * @param {boolean} isBusy
 */
function setFormBusy(form, isBusy) {
    form.querySelector('[type="submit"]').disabled = isBusy;
}

/**
 * Saves the form to the database: change (id on the form) or create (no id)
 * @param {HTMLFormElement} form
 * @param {{name: string, email: string, phone: string}} values
 */
async function saveFromForm(form, values) {
    let contact;
    let message;
    if (form.dataset.contactId) {
        contact = buildChangedContact(Number(form.dataset.contactId), values);
        message = "Contact successfully saved";
    } else {
        contact = buildNewContact(values);
        message = "Contact successfully created";
    }
    await ContactsApi.saveContact(contact);
    storeContact(contact);
    finishSave(contact.id, message);
}

/**
 * Saves with the button switched off
 * @param {HTMLFormElement} form
 * @param {{name: string, email: string, phone: string}} values
 */
async function trySave(form, values) {
    setFormBusy(form, true);
    try {
        await saveFromForm(form, values);
    } catch {
        setFormBusy(form, false);
        showToast("Could not save. Please try again.");
    }
}

/**
 * Form submit: validate, then save
 * @param {SubmitEvent} event
 */
function handleFormSubmit(event) {
    event.preventDefault();
    const values = readFormValues(event.target);
    if (validateContactForm(values)) {
        trySave(event.target, values);
    }
}
