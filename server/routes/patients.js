const express = require('express');
const router = express.Router();
const pool = require('../db');
const { updatePatient } = require('../models/patientModel');
const { createWaterTest, getWaterTests } = require('../models/waterTestModel');

// Get all patients
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM patients ORDER BY last_name, first_name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single patient by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM patients WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching patient:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new patient
router.post('/', async (req, res) => {
  try {
    const {
      first_name, last_name, gender, blood_type, rh_factor, duty_status, pid,
      paygrade, branch_of_service, ethnicity, religion, dod_id, date_of_birth, phone_number, is_active
    } = req.body

    const result = await pool.query(
      `INSERT INTO patients (
        first_name, last_name, gender, blood_type, rh_factor, duty_status, pid,
        paygrade, branch_of_service, ethnicity, religion, dod_id, date_of_birth, phone_number, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [
        first_name, last_name, gender, blood_type, rh_factor, duty_status, pid,
        paygrade, branch_of_service, ethnicity, religion, dod_id, date_of_birth, phone_number, is_active
      ]
    )

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating patient:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update patient
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await updatePatient(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error('Error updating patient:', err);
    if (err.code === '23505') {
      res.status(400).json({ error: 'Duplicate PID or DoD ID' });
    } else {
      res.status(500).json({ error: 'Failed to update patient' });
    }
  }
});

// Delete patient (hard delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM patients WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    console.error('Error deleting patient:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get water tests for a patient
router.get('/:id/water-tests', async (req, res) => {
  try {
    const tests = await getWaterTests(req.params.id);
    res.json(tests);
  } catch (err) {
    console.error('Error fetching water tests:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add water test for a patient
router.post('/:id/water-tests', async (req, res) => {
  try {
    const test = await createWaterTest(req.params.id, req.body);
    res.status(201).json(test);
  } catch (err) {
    console.error('Error creating water test:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search patients
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const result = await pool.query(
      `SELECT * FROM patients
       WHERE (first_name ILIKE $1 OR last_name ILIKE $1)
       AND is_active = true
       ORDER BY last_name, first_name`,
      [`%${q}%`]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error searching patients:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 
