const db = require("./db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error("❌ Error creating users table:", err);
    else console.log("✅ Users table ready.");
  });

  // ⚠️ Drop and recreate posts table to fix missing 'username' column
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error("❌ Error creating posts table:", err);
    else console.log("✅ Posts table recreated.");
  });
});

module.exports = db;
