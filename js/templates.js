const ContactsTemplate = {
    
     * Makes text safe for HTML (names come from an input field)
     * @param {string} text
     * @returns {string}
     */
    escapeHtml(text) {
        const replacements = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
        return text.replace(/[&<>"']/g, (character) => replacements[character]);
    },

    
     * First letter of the first and of the last word ("Anton Mayer" gives "AM")
     * @param {string} name
     * @returns {string}
     */
    getInitials(name) {
        const words = name.trim().split(/\s+/);
        const firstLetter = words[0].charAt(0);
        const lastLetter = words.length > 1 ? words[words.length - 1].charAt(0) : "";
        return (firstLetter + lastLetter).toUpperCase();
    },
    
     * One list entry with avatar, name and email
     * @param {Contact} contact
     * @returns {string}
     */
    contact(contact) {
        const t = ContactsTemplate;
        return `
            <li>
                <button type="button" class="contact" data-action="select-contact" data-id="${contact.id}">
                    <span class="contact__avatar contact__avatar--${contact.color}" aria-hidden="true">${t.escapeHtml(t.getInitials(contact.name))}</span>
                    <span class="contact__text">
                        <span class="contact__name">${t.escapeHtml(contact.name)}</span>
                        <span class="contact__email">${t.escapeHtml(contact.email)}</span>
                    </span>
                </button>
            </li>`;
    },

    
     * One letter heading with its contacts
     * @param {string} letter
     * @param {string} contactsHtml
     * @returns {string}
     */
    group(letter, contactsHtml) {
        const safeLetter = ContactsTemplate.escapeHtml(letter);
        return `
            <section class="contacts__group" aria-label="Contacts ${safeLetter}">
                <h2 class="contacts__group-letter">${safeLetter}</h2>
                <hr class="contacts__group-line">
                <ul class="contacts__items">${contactsHtml}</ul>
            </section>`;
    },

    
     * A short message instead of the list ("Loading contacts...")
     * @param {string} text
     * @returns {string}
     */
    status(text) {
        return `<p class="contacts__status" role="status">${ContactsTemplate.escapeHtml(text)}</p>`;
    },

    
     * Message and "Try again" button when loading failed
     * @returns {string}
     */
    loadError() {
        return `
            <p class="contacts__status" role="alert">Contacts could not be loaded.</p>
            <button type="button" class="contacts__status-button" data-action="retry-load">Try again</button>`;
    },
    
     * Edit and Delete next to the name
     * @param {number} contactId
     * @returns {string}
     */
    detailActions(contactId) {
        return `
            <div class="detail__actions">
                <button type="button" class="detail__action" data-action="edit-contact" data-id="${contactId}">
                    <img src="../assets/icons/edit.svg" alt="">Edit
                </button>
                <button type="button" class="detail__action" data-action="delete-contact" data-id="${contactId}">
                    <img src="../assets/icons/delete.svg" alt="">Delete
                </button>
            </div>`;
    },

    
     * Top part: big avatar, name, Edit and Delete
     * @param {Contact} contact
     * @returns {string}
     */
    detailTop(contact) {
        const t = ContactsTemplate;
        return `
            <div class="detail__top">
                <span class="detail__avatar contact__avatar--${contact.color}" aria-hidden="true">${t.escapeHtml(t.getInitials(contact.name))}</span>
                <div class="detail__headline">
                    <h2 class="detail__name">${t.escapeHtml(contact.name)}</h2>
                    ${t.detailActions(contact.id)}
                </div>
            </div>`;
    },

    
     * Lower part: email and phone
     * @param {Contact} contact
     * @returns {string}
     */
    detailInfo(contact) {
        const email = ContactsTemplate.escapeHtml(contact.email);
        return `
            <h3 class="detail__subtitle">Contact Information</h3>
            <dl class="detail__info">
                <dt>Email</dt>
                <dd><a class="detail__link" href="mailto:${email}">${email}</a></dd>
                <dt>Phone</dt>
                <dd>${ContactsTemplate.escapeHtml(contact.phone)}</dd>
            </dl>`;
    },

    
     * Whole detail view
     * @param {Contact} contact
     * @returns {string}
     */
    detail(contact) {
        const t = ContactsTemplate;
        return `<article class="detail">${t.detailTop(contact)}${t.detailInfo(contact)}</article>`;
    },
    
     * Buttons for a new contact
     * @returns {string}
     */
    addButtons() {
        return `
            <button type="button" class="overlay__button overlay__button--secondary" data-action="close-overlay">
                Cancel <img src="../assets/icons/close.svg" alt="">
            </button>
            <button type="submit" class="overlay__button overlay__button--primary">
                Create contact <img src="../assets/icons/check.svg" alt="">
            </button>`;
    },

    
     * Buttons for an existing contact
     * @param {number} contactId
     * @returns {string}
     */
    editButtons(contactId) {
        return `
            <button type="button" class="overlay__button overlay__button--secondary" data-action="delete-contact" data-id="${contactId}">
                Delete
            </button>
            <button type="submit" class="overlay__button overlay__button--primary">
                Save <img src="../assets/icons/check.svg" alt="">
            </button>`;
    },

    
     * Everything the overlay needs for a new contact
     * @returns {Object}
     */
    addConfig() {
        return {
            title: "Add contact",
            sloganHtml: '<p class="overlay__slogan">Tasks are better with a team!</p>',
            avatarHtml: '<span class="overlay__avatar overlay__avatar--empty" aria-hidden="true"><img src="../assets/icons/personWhite.svg" alt=""></span>',
            buttonsHtml: ContactsTemplate.addButtons(),
            contactId: "",
            values: { name: "", email: "", phone: "" },
        };
    },

    
     * Everything the overlay needs for an existing contact
     * @param {Contact} contact
     * @returns {Object}
     */
    editConfig(contact) {
        const t = ContactsTemplate;
        const initials = t.escapeHtml(t.getInitials(contact.name));
        return {
            title: "Edit contact",
            sloganHtml: "",
            avatarHtml: `<span class="overlay__avatar overlay__avatar--initials contact__avatar--${contact.color}" aria-hidden="true">${initials}</span>`,
            buttonsHtml: t.editButtons(contact.id),
            contactId: contact.id,
            values: { name: contact.name, email: contact.email, phone: contact.phone },
        };
    },
    
     * One input row with icon and error line
     * @param {{id: string, type: string, placeholder: string, icon: string}} field
     * @param {string} value
     * @returns {string}
     */
    field(field, value) {
        return `
            <div class="overlay__field">
                <div class="overlay__input-wrap">
                    <label class="visually-hidden" for="${field.id}">${field.placeholder}</label>
                    <input class="overlay__input" id="${field.id}" name="${field.id}" type="${field.type}"
                        placeholder="${field.placeholder}" value="${ContactsTemplate.escapeHtml(value)}" autocomplete="off" aria-describedby="${field.id}Error">
                    <img class="overlay__input-icon" src="../assets/icons/${field.icon}" alt="">
                </div>
                <p class="overlay__error" id="${field.id}Error" aria-live="polite"></p>
            </div>`;
    },

     * The three input rows
     * @param {{name: string, email: string, phone: string}} values
     * @returns {string}
     */
    fields(values) {
        const t = ContactsTemplate;
        return [
            t.field({ id: "contactName", type: "text", placeholder: "Name", icon: "person.svg" }, values.name),
            t.field({ id: "contactEmail", type: "email", placeholder: "Email", icon: "mailOutline.svg" }, values.email),
            t.field({ id: "contactPhone", type: "tel", placeholder: "Phone", icon: "phone.svg" }, values.phone),
        ].join("");
    },

     * Dark side (top on phones) with logo, title and slogan
     * @param {Object} config
     * @returns {string}
     */
    overlayHead(config) {
        return `
            <div class="overlay__head">
                <img class="overlay__logo" src="../assets/icons/joinDesktop.svg" alt="JOIN logo">
                <h2 class="overlay__title" id="overlayTitle">${config.title}</h2>
                ${config.sloganHtml}
                <span class="overlay__underline" aria-hidden="true"></span>
            </div>`;
    },

     * Form with fields and buttons
     * @param {Object} config
     * @returns {string}
     */
    overlayForm(config) {
        return `
            <form class="overlay__form" id="contactForm" data-contact-id="${config.contactId}" novalidate>
                ${ContactsTemplate.fields(config.values)}
                <div class="overlay__buttons">${config.buttonsHtml}</div>
            </form>`;
    },

    
     * White side of the card: close button, avatar and form
     * @param {Object} config
     * @returns {string}
     */
    overlayBody(config) {
        return `
            <div class="overlay__body">
                <button type="button" class="overlay__close" data-action="close-overlay" aria-label="Close">
                    <img src="../assets/icons/close.svg" alt="">
                </button>
                ${config.avatarHtml}
                ${ContactsTemplate.overlayForm(config)}
            </div>`;
    },

    
     * Complete overlay: backdrop and card
     * @param {Object} config
     * @returns {string}
     */
    overlay(config) {
        const t = ContactsTemplate;
        return `
            <div class="overlay" id="overlay" data-action="close-backdrop">
                <section class="overlay__card" role="dialog" aria-modal="true" aria-labelledby="overlayTitle">
                    ${t.overlayHead(config)}
                    ${t.overlayBody(config)}
                </section>
            </div>`;
    },
    
     * The small question window "Delete <name>?"
     * @param {Contact} contact
     * @returns {string}
     */
    confirm(contact) {
        return `
            <div class="overlay" id="confirmOverlay" data-action="close-backdrop">
                <section class="confirm" role="alertdialog" aria-modal="true" aria-labelledby="confirmTitle">
                    <h2 class="confirm__title" id="confirmTitle">Delete ${ContactsTemplate.escapeHtml(contact.name)}?</h2>
                    <p class="confirm__text">This cannot be undone.</p>
                    <div class="overlay__buttons">
                        <button type="button" class="overlay__button overlay__button--secondary" data-action="close-confirm">Cancel</button>
                        <button type="button" class="overlay__button overlay__button--danger" data-action="confirm-delete" data-id="${contact.id}">Delete</button>
                    </div>
                </section>
            </div>`;
    },
};
