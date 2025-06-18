const express = require("express");
const cors = require("cors");

const signup = require("./auth/signup");
const login = require("./auth/login");
const postRoutes = require("./routes/posts"); // correct filename
const db = require("./initDB"); // or wherever your init file is

const { authenticateToken, authorizeRoles } = require("./auth/middleware");

const app = express();

app.use(
    cors({
      origin: ["http://localhost:5173", "http://localhost:5174"], // ✅ allow both
      credentials: true,
    })
  );
  app.use(express.json());

app.use(signup);
app.use(login);
app.use("/api", postRoutes); // Exposes POST /api/post

app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is protected", user: req.user });
});

app.get("/admin-only", authenticateToken, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome, admin!" });
});

app.listen(8080, () => {
  console.log("Server started on http://localhost:8080");
});
