const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../auth/middleware');

// POST /api/subscribe - Subscribe to a poster
router.post('/subscribe', authenticateToken, (req, res) => {
  const subscriberUsername = req.user.username;
  const { posterUsername } = req.body;

  if (!posterUsername) {
    return res.status(400).json({ error: 'Poster username is required.' });
  }

  if (subscriberUsername === posterUsername) {
    return res.status(400).json({ error: 'You cannot subscribe to yourself.' });
  }

  // Check if the poster exists
  db.get('SELECT * FROM users WHERE username = ? AND role = ?', [posterUsername, 'poster'], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error.' });
    }
    if (!user) {
      return res.status(404).json({ error: 'Poster not found.' });
    }

    // Create the subscription
    db.run('INSERT INTO subscriptions (subscriber_username, poster_username) VALUES (?, ?)', [subscriberUsername, posterUsername], function(err) {
      if (err) {
        // Handle cases where the subscription already exists
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