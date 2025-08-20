import express from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// Get all pop8 records
router.get('/', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM pop8');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching pop8 records:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new pop8 record
router.post('/', async (req, res) => {
  const { name, value } = req.body;
  try {
    const { rows } = await query(
      'INSERT INTO pop8 (name, value) VALUES ($1, $2) RETURNING *',
      [name, value]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating pop8 record:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a pop8 record
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, value } = req.body;
  try {
    const { rows } = await query(
      'UPDATE pop8 SET name = $1, value = $2 WHERE id = $3 RETURNING *',
      [name, value, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating pop8 record:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a pop8 record
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await query('DELETE FROM pop8 WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting pop8 record:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
