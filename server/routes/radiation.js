const express = require('express');
const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Radiation routes are working' });
});

// Overview endpoint
router.get('/overview', (req, res) => {
  res.json({ message: 'Overview endpoint working' });
});

// 2. Personnel list
router.get('/personnel', async (req, res) => {
  try {
    const { Pool } = require('pg');
    const testPool = new Pool({
      connectionString: 'postgresql://postgres:postgres@localhost:5432/ehr_eng2'
    });
    
    const result = await testPool.query('SELECT * FROM radiation_personnel WHERE active = true LIMIT 10');
    
    await testPool.end();
    res.json(result.rows);
  } catch (error) {
    console.error('Personnel fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch personnel data', details: error.message });
  }
});

// 3. Device inventory
router.get('/devices', async (req, res) => {
  try {
    const pool = require('../db');
    const result = await pool.query(`
      SELECT d.*, dm.vendor, dm.model, dm.hp10_support, dm.hp007_support,
             COUNT(dr.id) as reading_count,
             MAX(dr.measured_ts) as last_reading
      FROM radiation_devices d
      LEFT JOIN radiation_device_models dm ON d.model_id = dm.id
      LEFT JOIN radiation_dose_readings dr ON d.id = dr.device_id
      WHERE d.retired_at IS NULL
      GROUP BY d.id, dm.vendor, dm.model, dm.hp10_support, dm.hp007_support
      ORDER BY d.serial
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Devices fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch device data' });
  }
});

// 4. Dose readings with filtering
router.get('/readings', async (req, res) => {
  try {
    const pool = require('../db');
    const { device_id, personnel_id, start_date, end_date, limit = 100 } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (device_id) {
      paramCount++;
      whereClause += ` AND dr.device_id = $${paramCount}`;
      params.push(device_id);
    }

    if (personnel_id) {
      paramCount++;
      whereClause += ` AND a.personnel_id = $${paramCount}`;
      params.push(personnel_id);
    }

    if (start_date) {
      paramCount++;
      whereClause += ` AND dr.measured_ts >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      whereClause += ` AND dr.measured_ts <= $${paramCount}`;
      params.push(end_date);
    }

    const result = await pool.query(`
      SELECT dr.*, d.serial as device_serial, dm.vendor, dm.model,
             p.lname, p.fname, p.rank_rate
      FROM radiation_dose_readings dr
      LEFT JOIN radiation_devices d ON dr.device_id = d.id
      LEFT JOIN radiation_device_models dm ON d.model_id = dm.id
      LEFT JOIN radiation_assignments a ON d.id = a.device_id
      LEFT JOIN radiation_personnel p ON a.personnel_id = p.id
      ${whereClause}
      ORDER BY dr.measured_ts DESC
      LIMIT $${paramCount + 1}
    `, [...params, parseInt(limit)]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Readings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch dose readings' });
  }
});

// 5. Active alerts
router.get('/alerts', async (req, res) => {
  try {
    const pool = require('../db');
    const result = await pool.query(`
      SELECT a.*, d.serial as device_serial, p.lname, p.fname, p.rank_rate
      FROM radiation_alerts a
      LEFT JOIN radiation_devices d ON a.device_id = d.id
      LEFT JOIN radiation_personnel p ON a.personnel_id = p.id
      WHERE a.ack_ts IS NULL
      ORDER BY a.created_ts DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Alerts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// 6. Dose reconciliation
router.get('/reconciliations', async (req, res) => {
  try {
    const pool = require('../db');
    const result = await pool.query(`
      SELECT r.*, p.lname, p.fname, p.rank_rate, np.period_start, np.period_end
      FROM radiation_reconciliations r
      LEFT JOIN radiation_personnel p ON r.personnel_id = p.id
      LEFT JOIN radiation_ndc_periods np ON r.period_id = np.id
      ORDER BY r.created_ts DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Reconciliations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch reconciliations' });
  }
});

// 7. Ingest new dose reading (POST endpoint for gateways)
router.post('/ingest/readings', async (req, res) => {
  try {
    const pool = require('../db');
    const {
      device_serial,
      measured_ts,
      hp10_mSv,
      hp007_mSv,
      rate_uSv_h,
      battery_pct,
      raw_json,
      gateway_id,
      payload_sig,
      sig_alg
    } = req.body;

    // Validate required fields
    if (!device_serial || !measured_ts || !gateway_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get device ID from serial
    const deviceResult = await pool.query(
      'SELECT id FROM radiation_devices WHERE serial = $1 AND retired_at IS NULL',
      [device_serial]
    );

    if (deviceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Device not found or retired' });
    }

    const deviceId = deviceResult.rows[0].id;

    // Insert dose reading
    const result = await pool.query(`
      INSERT INTO radiation_dose_readings 
      (device_id, measured_ts, gateway_ts, hp10_mSv, hp007_mSv, rate_uSv_h, battery_pct, raw_json, payload_sig, sig_alg, gateway_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `, [deviceId, measured_ts, new Date(), hp10_mSv, hp007_mSv, rate_uSv_h, battery_pct, raw_json, payload_sig, sig_alg, gateway_id]);

    // Check for alerts (basic threshold checking)
    if (hp10_mSv > 0.1) { // 100 µSv threshold
      await pool.query(`
        INSERT INTO radiation_alerts (type, severity, threshold, value, device_id, measured_ts, details)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, ['DOSE_THRESHOLD', 'MEDIUM', 0.1, hp10_mSv, deviceId, measured_ts, { 'threshold_exceeded': true }]);
    }

    res.json({ 
      success: true, 
      reading_id: result.rows[0].id,
      message: 'Dose reading ingested successfully'
    });

  } catch (error) {
    console.error('Ingest error:', error);
    res.status(500).json({ error: 'Failed to ingest dose reading' });
  }
});

// 8. Acknowledge alert
router.put('/alerts/:id/ack', async (req, res) => {
  try {
    const pool = require('../db');
    const { id } = req.params;
    const { ack_by } = req.body;

    if (!ack_by) {
      return res.status(400).json({ error: 'Acknowledgment user required' });
    }

    await pool.query(
      'UPDATE radiation_alerts SET ack_by = $1, ack_ts = NOW() WHERE id = $2',
      [ack_by, id]
    );

    res.json({ success: true, message: 'Alert acknowledged' });
  } catch (error) {
    console.error('Alert ack error:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

module.exports = router;
