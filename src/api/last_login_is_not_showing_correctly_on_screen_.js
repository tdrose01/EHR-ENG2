// API routes for last login is not showing correctly on screen.
const router = require('express').Router();

router.get('/last_login_is_not_showing_correctly_on_screen_', (req, res) => {
  res.json({ message: 'Hello from the last_login_is_not_showing_correctly_on_screen_ API!' });
});

module.exports = router;