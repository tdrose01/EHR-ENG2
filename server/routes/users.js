const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Query the users table
    const result = await pool.query(
      'SELECT id, email, role, last_login AS last_login_at FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const user = result.rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        last_login_at: user.last_login_at
      }
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// GET /api/users - Get all users (basic info only)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, last_login AS last_login_at FROM users ORDER BY id DESC'
    );

    const users = result.rows.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      last_login_at: user.last_login_at
    }));
    
    res.json({
      success: true,
      users: users
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

module.exports = router;



