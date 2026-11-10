/**
 * Address of the Firebase Realtime Database (public by design, access is limited by the database rules).
 * @type {{databaseUrl: string}}
 */
const firebaseConfig = {
    databaseUrl: "https://join-contacts-2026-default-rtdb.europe-west1.firebasedatabase.app",
};

/**
 * One request to the database (used for contacts, tasks and users)
 * @param {string} path - for example "contacts/c1"
 * @param {string} method - "GET", "PUT" or "DELETE"
 * @param {Object} [body]
 * @returns {Promise<any>}
 */
async function firebaseRequest(path, method, body) {
    const options = { method, body: body === undefined ? undefined : JSON.stringify(body) };
    const response = await fetch(`${firebaseConfig.databaseUrl}/${path}.json`, options);
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    return response.json();
}
