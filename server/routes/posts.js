const express = require("express");
const db = require("../db");
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

// GET /post/:username — Get posts by a user
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

// GET /posts — Get all posts with comments
router.get("/posts", (req, res) => {
  db.all("SELECT * FROM posts", [], (err, posts) => {
    if (err) return res.status(500).json({ error: "Failed to fetch posts" });

    const ids = posts.map((p) => p.id);
    if (ids.length === 0) return res.json({ posts: [] });

    db.all(
      `SELECT * FROM comments WHERE post_id IN (${ids.map(() => "?").join(",")})`,
      ids,
      (err, comments) => {
        if (err) return res.status(500).json({ error: "Failed to fetch comments" });

        const result = posts.map((post) => ({
          ...post,
          comments: comments.filter((c) => c.post_id === post.id),
        }));
        res.json({ posts: result });
      }
    );
  });
});

// POST /comment — Add a comment
router.post("/comment", (req, res) => {
  const { post_id, username, text } = req.body;
  if (!post_id || !username || !text) {
    return res.status(400).json({ error: "All fields required" });
  }

  db.run(
    "INSERT INTO comments (post_id, username, text) VALUES (?, ?, ?)",
    [post_id, username, text],
    function (err) {
      if (err) {
        console.error("DB comment error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res.status(201).json({ message: "Comment added", commentId: this.lastID });
    }
  );
});

module.exports = router;
