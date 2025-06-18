const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, password, role } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, hashed, role],
    function (err) {
      if (err) return res.status(400).json({ error: "Username taken" });
      res.json({ id: this.lastID, username, role });
    }
  );
});

module.exports = router;
