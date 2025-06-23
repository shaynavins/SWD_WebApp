const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../db");
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      cb(null, true);
    } else {
      cb(new Error('Only .jpg, .jpeg, .png files allowed'));
    }
  }
});

// POST /post — Create a new post (handles both JSON and FormData)
router.post("/post", upload.single('image'), (req, res) => {
  let username, title, body;
  
  // Handle both JSON and FormData
  if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
    // JSON request
    ({ username, title, body } = req.body);
  } else {
    // FormData request
    username = req.body.username;
    title = req.body.title;
    body = req.body.body;
  }
  
  const likes = 0;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!username || !title || !body) {
    return res.status(400).json({ error: "All fields required" });
  }

  db.run(
    "INSERT INTO posts (username, title, body, likes, image_url) VALUES (?, ?, ?, ?, ?)",
    [username, title, body, likes, imageUrl],
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
          likes,
          imageUrl,
        },
      });
    }
  );
});

router.put("/post/:id/like", (req, res) => {
  const { id } = req.params;

  db.run(
    "UPDATE posts SET likes = likes + 1 WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        console.error("Like error:", err);
        return res.status(500).json({ error: "Failed to like post" });
      }
      res.json({ message: "Post liked" });
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

    // Transform the data to use consistent field names
    const posts = rows.map(post => ({
      ...post,
      imageUrl: post.image_url, // Map image_url to imageUrl
      image_url: undefined // Remove the original field
    }));

    res.json({ posts });
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
          imageUrl: post.image_url, // Map image_url to imageUrl
          image_url: undefined, // Remove the original field
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


router.get("/api/posts", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Get total count of posts
  db.get("SELECT COUNT(*) AS count FROM posts", (err, countRow) => {
    if (err) return res.status(500).json({ error: "Database error" });

    const total = countRow.count;
    const hasMore = page * limit < total;

    // Now fetch the paginated posts
    db.all("SELECT * FROM posts ORDER BY id DESC LIMIT ? OFFSET ?", [limit, offset], (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });

      res.json({
        posts: rows,
        hasMore: hasMore
      });
    });
  });
});

// GET /posters — Get all poster usernames
router.get("/posters", (req, res) => {
  db.all("SELECT username FROM users WHERE role = 'poster'", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    const usernames = rows.map(row => row.username);
    res.json({ posters: usernames });
  });
});

module.exports = router;
