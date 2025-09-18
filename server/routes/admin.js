const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const backupService = require('../services/backupService');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { verifyToken, requireAdmin, login } = require('../middleware/auth');

// JWT-based admin authentication for backup operations
const checkAdminSimple = (req, res, next) => {
  console.log('Admin middleware called for:', req.method, req.path);
  // Use JWT authentication for backup endpoints
  verifyToken(req, res, (err) => {
    if (err) return;
    requireAdmin(req, res, next);
  });
};

// JWT-based admin authentication for user management
const checkAdmin = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return;
    requireAdmin(req, res, next);
  });
};

// POST /api/admin/login - Admin login endpoint
router.post('/login', login);

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
  const { email, password, role = 'user' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Validate role
  const validRoles = ['admin', 'user', 'manager', 'viewer'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be one of: admin, user, manager, viewer' });
  }

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const newUser = await User.create(email, password, role);
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

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', checkAdmin, async (req, res) => {
  const { id } = req.params;
  const { newRole } = req.body;

  if (!newRole) {
    return res.status(400).json({ error: 'New role is required' });
  }

  // Validate role
  const validRoles = ['admin', 'user', 'manager', 'viewer'];
  if (!validRoles.includes(newRole)) {
    return res.status(400).json({ error: 'Invalid role. Must be one of: admin, user, manager, viewer' });
  }

  try {
    const updated = await User.updateRole(id, newRole);
    if (updated) {
      res.status(200).json({ message: 'Role updated successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', checkAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await User.deleteUser(id);
    if (deleted) {
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/roles
router.get('/roles', checkAdminSimple, async (req, res) => {
  try {
    const roles = await User.getRoles();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const WORKSPACE_FILE = path.join(__dirname, '..', '..', 'workspace.txt');
const TASK_QUEUE_FILE = 'task_queue.json';

// POST /api/admin/backup/create
router.post('/backup/create', checkAdminSimple, async (req, res) => {
  try {
    const { description, location, customPath } = req.body;
    const result = await backupService.createBackup(description, location, customPath);
    res.json(result);
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/backup/locations
router.get('/backup/locations', checkAdminSimple, async (req, res) => {
  try {
    const locations = backupService.getAvailableBackupLocations();
    res.json(locations);
  } catch (error) {
    console.error('Error getting backup locations:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/backup/list
router.get('/backup/list', checkAdminSimple, async (req, res) => {
  console.log('Backup list route called');
  try {
    const backups = await backupService.listBackups();
    console.log('Backups retrieved:', backups.length);
    res.json(backups);
  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/backup/restore
router.post('/backup/restore', checkAdminSimple, async (req, res) => {
  try {
    const { backupId } = req.body;
    if (!backupId) {
      return res.status(400).json({ error: 'Backup ID is required' });
    }
    
    const result = await backupService.restoreBackup(backupId);
    res.json(result);
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/backup/download/:id
router.get('/backup/download/:id', checkAdminSimple, async (req, res) => {
  try {
    const { id } = req.params;
    const backup = await backupService.getBackupById(id);
    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }
    
    res.download(backup.filepath, backup.filename);
  } catch (error) {
    console.error('Error downloading backup:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/backup/delete
router.delete('/backup/delete', checkAdminSimple, async (req, res) => {
  try {
    const { backupId } = req.body;
    if (!backupId) {
      return res.status(400).json({ error: 'Backup ID is required' });
    }
    
    const result = await backupService.deleteBackup(backupId);
    res.json(result);
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ error: error.message });
  }
});

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

// GET /api/admin/database/schema - Database schema endpoint for testing
router.get('/database/schema', async (req, res) => {
  try {
    const pool = require('../db');
    
    // Get comprehensive table information
    const tablesQuery = `
      SELECT 
        t.table_name,
        t.table_type,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        c.character_maximum_length,
        c.numeric_precision,
        c.numeric_scale
      FROM information_schema.tables t
      LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
      WHERE t.table_schema = 'public' 
      AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name, c.ordinal_position
    `;
    
    const tablesResult = await pool.query(tablesQuery);
    
    // Group columns by table
    const schema = {};
    tablesResult.rows.forEach(row => {
      if (!schema[row.table_name]) {
        schema[row.table_name] = {
          type: row.table_type,
          columns: []
        };
      }
      if (row.column_name) {
        schema[row.table_name].columns.push({
          column: row.column_name,
          type: row.data_type,
          nullable: row.is_nullable === 'YES',
          default: row.column_default,
          max_length: row.character_maximum_length,
          precision: row.numeric_precision,
          scale: row.numeric_scale
        });
      }
    });
    
    res.json({
      schema,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Admin schema fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch database schema' });
  }
});

module.exports = router;
