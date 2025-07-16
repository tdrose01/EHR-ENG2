const express = require('express');
const router = express.Router();
const { getExposures } = require('../models/exposureModel');

/**
 * @route   GET /api/exposures
 * @desc    Get all exposure events with filtering and pagination
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Extract filters from query parameters
    const filters = {
      metric_type: req.query.metric_type,
      location_code: req.query.location_code,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 20
    };

    const result = await getExposures(filters);
    res.json(result);
  } catch (err) {
    console.error('Error fetching exposure data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NOTE: A POST endpoint for manual submission would be added here in a real scenario.
// Example:
/*
router.post('/', async (req, res) => {
  // Logic to insert a new exposure record and its details
  // This would involve a transaction to ensure data integrity across tables.
  res.status(201).json({ message: 'Endpoint not fully implemented yet.' });
});
*/

// NOTE: An endpoint for aggregated summary data would also be added here.
// Example:
/*
router.get('/summary', async (req, res) => {
  // Logic to query aggregated data (e.g., daily averages)
  res.json({ message: 'Endpoint not fully implemented yet.' });
});
*/

module.exports = router;
