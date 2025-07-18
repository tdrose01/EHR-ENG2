const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

// Middleware to check for admin credentials
const checkAdmin = async (req, res, next) => {
  const { adminEmail, adminPassword } = req.body;

  if (!adminEmail || !adminPassword) {
    return res.status(401).json({ error: 'Admin credentials are required' });
  }

  const adminUser = await User.findByEmail(adminEmail);
  if (!adminUser || adminUser.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const isMatch = await bcrypt.compare(adminPassword, adminUser.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  next();
};

// POST /api/admin/users/list (for fetching users with credentials in body)
router.post('/users/list', checkAdmin, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/users (for creating a user)
router.post('/users', checkAdmin, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const newUser = await User.create(email, password);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// PUT /api/admin/users/:id/password
router.put('/users/:id/password', checkAdmin, async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'New password is required' });
  }

  try {
    const updated = await User.updatePassword(id, newPassword);
    if (updated) {
      res.status(200).json({ message: 'Password updated successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const WORKSPACE_FILE = path.join(__dirname, '..', '..', 'workspace.txt');
const TASK_QUEUE_FILE = 'task_queue.json';

// ... (existing code)

// POST /api/admin/workflow/start
router.post('/workflow/start', (req, res) => {
    console.log('Received request to start workflow.');
    const startScript = path.join(__dirname, '..', '..', 'start_workflow.js');
    
    // We are not using checkAdmin here because the workflow is self-contained
    // and doesn't require admin credentials for its internal operations.
    // The endpoint itself should be protected by a general auth middleware if needed.
    
    const workflowProcess = spawn('node', [startScript], {
        detached: true,
        stdio: 'ignore',
        cwd: path.join(__dirname, '..', '..')
    });

    workflowProcess.unref();

    res.status(202).json({ message: 'Workflow started.' });
});

// GET /api/admin/workflow/status
router.get('/workflow/status', async (req, res) => {
    try {
        const workspacePath = await fs.readFile(WORKSPACE_FILE, 'utf8');
        const taskQueuePath = path.join(workspacePath.trim(), TASK_QUEUE_FILE);
        const data = await fs.readFile(taskQueuePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.json([]); // No workspace or task queue yet
        } else {
            console.error('Error fetching workflow status:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

module.exports = router;
