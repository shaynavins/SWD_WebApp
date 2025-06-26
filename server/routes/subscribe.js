const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../auth/middleware');

router.post('/subscribe', authenticateToken, (req, res) => {
  const subscriberUsername = req.user.username;
  const { posterUsername } = req.body;

  if (!posterUsername) {
    return res.status(400).json({ error: 'Poster username is required.' });
  }


  db.get('SELECT * FROM users WHERE username = ? AND role = ?', [posterUsername, 'poster'], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error.' });
    }
    if (!user) {
      return res.status(404).json({ error: 'Poster not found.' });
    }

    db.run('INSERT INTO subscriptions (subscriber_username, poster_username) VALUES (?, ?)', [subscriberUsername, posterUsername], function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(409).json({ error: 'You are already subscribed to this poster.' });
        }
        return res.status(500).json({ error: 'Failed to subscribe.' });
      }
      res.status(201).json({ message: `Successfully subscribed to ${posterUsername}.` });
    });
  });
});

module.exports = router; 