const ContactsApi = {
    /**
     * @returns {boolean}
     */
    isConfigured() {
        return firebaseConfig.databaseUrl !== "";
    },

    /**
     * Full address of one place in the database
     * @param {string} path
     * @returns {string}
     */
    getUrl(path) {
        const baseUrl = firebaseConfig.databaseUrl.replace(/\/$/, "");
        return `${baseUrl}/${path}.json`;
    },

    /**
     * One request
     * @param {string} path
     * @param {string} method
     * @param {Object} [body]
     * @returns {Promise<any>}
     */
    async request(path, method, body) {
        const options = { method };
        if (body !== undefined) {
            options.body = JSON.stringify(body);
        }
        const response = await fetch(ContactsApi.getUrl(path), options);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        return response.json();
    },

    /**
     * Checks one record from the database
     * @param {any} record
     * @returns {boolean}
     */
    isValidRecord(record) {
        const isObject = typeof record === "object" && record !== null;
        return isObject
            && Number.isFinite(record.id)
            && typeof record.name === "string" && record.name.trim() !== ""
            && typeof record.email === "string"
            && typeof record.phone === "string"
            && ContactsDB.avatarColors.includes(record.color);
    },

    /**
     * Turns the answer of the database into a contact list (invalid records are left out)
     * @param {Object|null} data
     * @returns {Contact[]}
     */
    toContacts(data) {
        if (data === null) {
            return [];
        }
        return Object.values(data).filter(ContactsApi.isValidRecord);
    },

    /**
     * Writes the start contacts into an empty database (once, for the very first visit)
     * @param {Contact[]} contacts
     * @returns {Promise<void>}
     */
    async seed(contacts) {
        const records = {};
        contacts.forEach((contact) => {
            records["c" + contact.id] = contact;
        });
        await ContactsApi.request("contacts", "PUT", records);
    },

    /**
     * Loads all contacts
     * @returns {Promise<Contact[]>}
     */
    async loadContacts() {
        const startContacts = ContactsDB.startContacts.map((contact) => ({ ...contact })); // spread: copy
        if (!ContactsApi.isConfigured()) {
            return startContacts;
        }
        const contacts = ContactsApi.toContacts(await ContactsApi.request("contacts", "GET"));
        if (contacts.length > 0) {
            return contacts;
        }
        await ContactsApi.seed(startContacts);
        return startContacts;
    },

    /**
     * Saves a new or changed contact
     * @param {Contact} contact
     * @returns {Promise<void>}
     */
    async saveContact(contact) {
        if (ContactsApi.isConfigured()) {
            await ContactsApi.request("contacts/c" + contact.id, "PUT", contact);
        }
    },

    /**
     * Deletes a contact
     * @param {number} contactId
     * @returns {Promise<void>}
     */
    async removeContact(contactId) {
        if (ContactsApi.isConfigured()) {
            await ContactsApi.request("contacts/c" + contactId, "DELETE");
        }
    },
};
