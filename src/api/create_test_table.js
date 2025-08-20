// API routes for create test table
const router = require('express').Router();

router.get('/create_test_table', (req, res) => {
  res.json({ message: 'Hello from the create_test_table API!' });
});

module.exports = router;