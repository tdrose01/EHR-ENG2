import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Create a new "fred" entry
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required' });
  }

  try {
    const { rows } = await query(
      'INSERT INTO fred (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating fred entry:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Read all "fred" entries
router.get('/', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM fred');
    res.json(rows);
  } catch (err) {
    console.error('Error reading fred entries:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Read a single "fred" entry by ID
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM fred WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Fred entry not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error reading fred entry:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a "fred" entry by ID
router.put('/:id', async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required' });
  }

  try {
    const { rows } = await query(
      'UPDATE fred SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Fred entry not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating fred entry:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a "fred" entry by ID
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM fred WHERE id = $1', [req.params.id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Fred entry not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting fred entry:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
