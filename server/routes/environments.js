const express = require('express')
const router = express.Router()
const pool = require('../db')

// Get all environments
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, status, last_check FROM environments ORDER BY name'
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Error fetching environments:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get single environment
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM environments WHERE id = $1', [
      id
    ])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Environment not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error fetching environment:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
