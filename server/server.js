const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const signup = require("./auth/signup");
const login = require("./auth/login");
const postRoutes = require("./routes/posts");
const subscriptionRoutes = require('./routes/subscribe');
const db = require("./initDB");
const { authenticateToken, authorizeRoles } = require("./auth/middleware");

const app = express(); 

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

// ✅ Middleware setup
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));
app.use(express.json());

// ✅ Serve static image files
app.use('/uploads', express.static('uploads'));

app.use('/api', signup);
app.use('/api', login);
app.use("/api", postRoutes); // e.g., /api/post
app.use("/api", subscriptionRoutes); // e.g., /api/subscribe

// ✅ Protected routes
app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is protected", user: req.user });
});

app.get("/admin-only", authenticateToken, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome, admin!" });
});

// ✅ Image-based post creation endpoint
app.post("/create-post", upload.single('image'), (req, res) => {
  const { title, content, userId, role } = req.body;

  if (role !== "poster") {
    return res.status(403).json({ error: "Only posters can create posts" });
  }

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(
    "INSERT INTO posts (title, content, user_id, image_url) VALUES (?, ?, ?, ?)",
    [title, content, userId, imageUrl],
    function (err) {
      if (err) {
        console.error("DB insert error:", err);
        return res.status(500).json({ error: "DB error" });
      }

      res.json({
        id: this.lastID,
        title,
        content,
        imageUrl,
      });
    }
  );
});

app.listen(8080, () => {
  console.log("Server started on http://localhost:8080");
});
