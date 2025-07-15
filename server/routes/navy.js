const express = require('express');
const router = express.Router();
const pool = require('../db');

// Overview summary
router.get('/overview', async (req, res) => {
  try {
    const personnelResult = await pool.query('SELECT COUNT(DISTINCT personnel) as personnel_count FROM navy_med_surveillance');
    const incidentsResult = await pool.query('SELECT COUNT(*) as incidents_count FROM navy_exposure_events WHERE date > NOW() - INTERVAL \'30 days\'');
    const pendingTestsResult = await pool.query('SELECT COUNT(*) as pending_tests_count FROM navy_bio_tests WHERE status = \'Pending\'');
    const alertsResult = await pool.query('SELECT COUNT(*) as alerts_count FROM navy_bio_tests WHERE status = \'Flagged\'');

    res.json({
      location: "USS Ronald Reagan, NAS Pensacola", // This can be made dynamic later
      unit: "VAQ-139", // This can be made dynamic later
      personnelMonitored: parseInt(personnelResult.rows[0].personnel_count, 10),
      incidentsThisMonth: parseInt(incidentsResult.rows[0].incidents_count, 10),
      pendingTests: parseInt(pendingTestsResult.rows[0].pending_tests_count, 10),
      recentAlerts: `Elevated BLLs in ${alertsResult.rows[0].alerts_count} personnel`
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Exposure events
router.get('/exposure-events', async (req, res) => {
  try {
    const allEvents = await pool.query('SELECT * FROM navy_exposure_events ORDER BY date DESC');
    res.json(allEvents.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Biological test results
router.get('/bio-tests', async (req, res) => {
  try {
    const allTests = await pool.query('SELECT * FROM navy_bio_tests ORDER BY sample_date DESC');
    res.json(allTests.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Medical surveillance compliance
router.get('/med-surveillance', async (req, res) => {
  try {
    const allSurveillance = await pool.query('SELECT * FROM navy_med_surveillance ORDER BY next_due ASC');
    res.json(allSurveillance.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Deployment environmental logs
router.get('/deployment-logs', async (req, res) => {
  try {
    const allLogs = await pool.query('SELECT * FROM navy_deployment_logs ORDER BY dates DESC');
    res.json(allLogs.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;