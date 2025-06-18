const express = require("express");
const db = require("../db"); // Your SQLite DB connection
const router = express.Router();

// POST /post — Create a new post
router.post("/post", (req, res) => {
  const { username, title, body } = req.body;

  if (!username || !title || !body) {
    return res.status(400).json({ error: "All fields required" });
  }

  db.run(
    "INSERT INTO posts (username, title, body) VALUES (?, ?, ?)",
    [username, title, body],
    function (err) {
      if (err) {
        console.error("DB insert error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res.status(201).json({
        message: "Post created",
        post: {
          id: this.lastID,
          username,
          title,
          body,
        },
      });
    }
  );
});

router.get("/post/:username", (req, res) => {
  const { username } = req.params;

  db.all("SELECT * FROM posts WHERE username = ?", [username], (err, rows) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ posts: rows });
  });
});



module.exports = router;
