/**
 * One contact.
 * @typedef {Object} Contact
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} color
 */

const ContactsDB = {
    /**
     * @type {Contact[]}
     */
    contacts: [],

    /**
     * @type {Contact[]}
     */
    startContacts: [
        { id: 1, name: "Anton Mayer", email: "antonm@gmail.com", phone: "+49 1111 111 11 1", color: "orange" },
        { id: 2, name: "Anja Schulz", email: "schulz@hotmail.com", phone: "+49 2222 333 44 5", color: "violet" },
        { id: 3, name: "Benedikt Ziegler", email: "benedikt@gmail.com", phone: "+49 3333 444 55 6", color: "indigo" },
        { id: 4, name: "David Eisenberg", email: "davidberg@gmail.com", phone: "+49 4444 555 66 7", color: "magenta" },
        { id: 5, name: "Eva Fischer", email: "eva@gmail.com", phone: "+49 5555 666 77 8", color: "amber" },
        { id: 6, name: "Emmanuel Mauer", email: "emmanuelma@gmail.com", phone: "+49 6666 777 88 9", color: "teal" },
        { id: 7, name: "Marcel Bauer", email: "bauer@gmail.com", phone: "+49 7777 888 99 0", color: "indigo" },
        { id: 8, name: "Tatjana Wolf", email: "wolf@gmail.com", phone: "+49 2222 222 22 2", color: "rose" },
        { id: 9, name: "Lena Hoffmann", email: "lena.hoffmann@gmail.com", phone: "+49 8888 123 45 6", color: "green" },
        { id: 10, name: "Jonas Becker", email: "jonas.becker@gmail.com", phone: "+49 9999 765 43 2", color: "violet" },
    ],

    /** New contacts get one of these in turn. */
    avatarColors: ["orange", "violet", "magenta", "teal", "green", "amber", "rose", "indigo"],
};
