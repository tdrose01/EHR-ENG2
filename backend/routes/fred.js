import express from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { validateFredInput } from '../middleware/validateFred.js';

const router = express.Router();
router.use(requireAuth);

// Create a new Fred entry
router.post('/', validateFredInput, async (req, res) => {
  const { name, description } = req.body;
  try {
    const { rows } = await query('INSERT INTO fred (name, description) VALUES ($1, $2) RETURNING *', [name, description]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating Fred entry:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all Fred entries
router.get('/', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM fred');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching Fred entries:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific Fred entry by ID
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM fred WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Fred entry not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching Fred entry:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a Fred entry
router.put('/:id', validateFredInput, async (req, res) => {
  const { name, description } = req.body;
  try {
    const { rows } = await query('UPDATE fred SET name = $1, description = $2 WHERE id = $3 RETURNING *', [name, description, req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Fred entry not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating Fred entry:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a Fred entry
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await query('DELETE FROM fred WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Fred entry not found' });
    }
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting Fred entry:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
