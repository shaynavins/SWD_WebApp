const db = require("./db");

db.serialize(() => {
  
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      likes INTEGER DEFAULT 0,
      image_url TEXT,
      scheduled_time TEXT,
      is_published INTEGER DEFAULT 0
    )
  `, (err) => {
    if (err) console.error("Error creating posts table:", err);
    else console.log("Posts table recreated.");
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER,
      username TEXT,
      text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id)
    )
  `, (err) => {
    if (err) console.error("Error creating comments table:", err);
    else console.log("Comments table ready.");
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error("Error creating users table:", err);
    else console.log("Users table ready.");
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      subscriber_username TEXT NOT NULL,
      poster_username TEXT NOT NULL,
      PRIMARY KEY (subscriber_username, poster_username),
      FOREIGN KEY (subscriber_username) REFERENCES users(username),
      FOREIGN KEY (poster_username) REFERENCES users(username)
    )
  `, (err) => {
    if (err) console.error("Error creating subscriptions table:", err);
    else console.log("Subscriptions table ready.");
  });
});

module.exports = db;
