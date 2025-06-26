// server/db.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        return console.error("Error opening database:", err.message);
    }
    console.log('Connected to the SQLite database.');
});

module.exports = db;
