/**
 * Accounts in the database (shared by Sign up and Log in).
 * A user is stored at /users/<hash of the email>. The password itself is never stored,
 * only a random salt and the hash of salt + password.
 * Database rules (set in the Firebase console): a user can only be created, never listed or changed.
 * @typedef {Object} UserRecord
 * @property {string} name
 * @property {string} email
 * @property {string} salt
 * @property {string} hash
 */

const AuthApi = {
    /**
     * SHA-256 hash of a text, written as hex
     * @param {string} text
     * @returns {Promise<string>}
     */
    async hash(text) {
        const bytes = new TextEncoder().encode(text);
        const digest = await crypto.subtle.digest("SHA-256", bytes);
        return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    },

    /**
     * One request to the database
     * @param {string} emailHash
     * @param {string} method
     * @param {UserRecord} [body]
     * @returns {Promise<any>}
     */
    async request(emailHash, method, body) {
        const baseUrl = firebaseConfig.databaseUrl.replace(/\/$/, "");
        const options = { method, body: body === undefined ? undefined : JSON.stringify(body) };
        const response = await fetch(`${baseUrl}/users/${emailHash}.json`, options);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        return response.json();
    },

    /**
     * Name of the record of one email (a hash, so the address is not part of the path)
     * @param {string} email
     * @returns {Promise<string>}
     */
    getRecordName(email) {
        return AuthApi.hash(email.trim().toLowerCase());
    },

    /**
     * Checks a record from the database
     * @param {any} record
     * @returns {boolean}
     */
    isValidRecord(record) {
        return typeof record === "object" && record !== null
            && typeof record.name === "string" && typeof record.email === "string"
            && typeof record.salt === "string" && typeof record.hash === "string";
    },

    /**
     * Finds the account of an email
     * @param {string} email
     * @returns {Promise<UserRecord|null>} null if there is no such account
     */
    async findUser(email) {
        const record = await AuthApi.request(await AuthApi.getRecordName(email), "GET");
        return AuthApi.isValidRecord(record) ? record : null;
    },

    /**
     * Creates a new account (the database refuses an email that already exists)
     * @param {string} name
     * @param {string} email
     * @param {string} password
     * @returns {Promise<void>}
     */
    async createUser(name, email, password) {
        const salt = crypto.randomUUID();
        const hash = await AuthApi.hash(salt + password);
        const record = { name: name.trim(), email: email.trim().toLowerCase(), salt, hash };
        await AuthApi.request(await AuthApi.getRecordName(email), "PUT", record);
    },

    /**
     * Checks email and password
     * @param {string} email
     * @param {string} password
     * @returns {Promise<UserRecord|null>} the account, or null if email or password is wrong
     */
    async checkLogin(email, password) {
        const user = await AuthApi.findUser(email);
        if (user === null) {
            return null;
        }
        const hash = await AuthApi.hash(user.salt + password);
        return hash === user.hash ? user : null;
    },
};
