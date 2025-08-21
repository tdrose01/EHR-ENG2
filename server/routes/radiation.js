const express = require('express');
const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Radiation routes are working' });
});

// Overview endpoint
router.get('/overview', async (req, res) => {
  try {
    const pool = require('../db');
    
    // Get personnel count
    const personnelResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM radiation_personnel 
      WHERE active = true
    `);
    
    // Get active devices count
    const devicesResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM radiation_devices 
      WHERE retired_at IS NULL
    `);
    
    // Get pending alerts count
    const alertsResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM radiation_alerts 
      WHERE ack_ts IS NULL
    `);
    
    // Get readings in last 24 hours
    const readingsResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM radiation_dose_readings 
      WHERE measured_ts >= NOW() - INTERVAL '24 hours'
    `);
    
    res.json({
      personnelMonitored: personnelResult.rows[0]?.count || 0,
      activeDevices: devicesResult.rows[0]?.count || 0,
      pendingAlerts: alertsResult.rows[0]?.count || 0,
      readingsLast24h: readingsResult.rows[0]?.count || 0
    });
    
  } catch (error) {
    console.error('Overview fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch overview data' });
  }
});

// 2. Personnel list
router.get('/personnel', async (req, res) => {
  try {
    const pool = require('../db');
    const result = await pool.query(`
      SELECT p.*, u.name as unit_name, d.serial as device_serial, 
             MAX(dr.measured_ts) as last_reading
      FROM radiation_personnel p
      LEFT JOIN radiation_units u ON p.unit_id = u.id
      LEFT JOIN radiation_assignments a ON p.id = a.personnel_id
      LEFT JOIN radiation_devices d ON a.device_id = d.id
      LEFT JOIN radiation_dose_readings dr ON d.id = dr.device_id
      WHERE p.active = true
      GROUP BY p.id, u.name, d.serial
      ORDER BY p.lname, p.fname
    `);
    
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

// 9. Get units for personnel form
router.get('/units', async (req, res) => {
  try {
    const pool = require('../db');
    const result = await pool.query('SELECT id, name FROM radiation_units ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Units fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch units' });
  }
});

// 10. Add new radiation personnel
router.post('/personnel', async (req, res) => {
  try {
    const pool = require('../db');
    const {
      fname,
      lname,
      rank_rate,
      edipi,
      unit_id,
      active,
      radiation_category,
      monitoring_frequency,
      dosimeter_type,
      last_medical_exam,
      next_medical_due,
      notes
    } = req.body;

    // Validate required fields
    if (!fname || !lname || !rank_rate || !edipi || !unit_id || !radiation_category || !monitoring_frequency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if EDIPI already exists
    const existingResult = await pool.query(
      'SELECT id FROM radiation_personnel WHERE edipi = $1',
      [edipi]
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({ error: 'Personnel with this EDIPI already exists' });
    }

    // Insert new personnel
    const result = await pool.query(`
      INSERT INTO radiation_personnel 
      (fname, lname, rank_rate, edipi, unit_id, active, radiation_category, monitoring_frequency, dosimeter_type, last_medical_exam, next_medical_due, notes, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING id
    `, [fname, lname, rank_rate, edipi, unit_id, active, radiation_category, monitoring_frequency, dosimeter_type, last_medical_exam, next_medical_due, notes]);

    res.json({ 
      success: true, 
      personnel_id: result.rows[0].id,
      message: 'Personnel added successfully'
    });

  } catch (error) {
    console.error('Add personnel error:', error);
    res.status(500).json({ error: 'Failed to add personnel' });
  }
});

// 11. Update radiation personnel
router.put('/personnel/:id', async (req, res) => {
  try {
    const pool = require('../db');
    const { id } = req.params;
    const {
      fname,
      lname,
      rank_rate,
      edipi,
      unit_id,
      active,
      radiation_category,
      monitoring_frequency,
      dosimeter_type,
      last_medical_exam,
      next_medical_due,
      notes
    } = req.body;

    // Validate required fields
    if (!fname || !lname || !rank_rate || !edipi || !unit_id || !radiation_category || !monitoring_frequency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if EDIPI already exists for other personnel
    const existingResult = await pool.query(
      'SELECT id FROM radiation_personnel WHERE edipi = $1 AND id != $2',
      [edipi, id]
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({ error: 'Personnel with this EDIPI already exists' });
    }

    // Update personnel
    await pool.query(`
      UPDATE radiation_personnel 
      SET fname = $1, lname = $2, rank_rate = $3, edipi = $4, unit_id = $5, active = $6, 
          radiation_category = $7, monitoring_frequency = $8, dosimeter_type = $9, 
          last_medical_exam = $10, next_medical_due = $11, notes = $12
      WHERE id = $13
    `, [fname, lname, rank_rate, edipi, unit_id, active, radiation_category, monitoring_frequency, dosimeter_type, last_medical_exam, next_medical_due, notes, id]);

    res.json({ 
      success: true, 
      message: 'Personnel updated successfully'
    });

  } catch (error) {
    console.error('Update personnel error:', error);
    res.status(500).json({ error: 'Failed to update personnel' });
  }
});

// 12. Get device assignments
router.get('/assignments', async (req, res) => {
  try {
    const pool = require('../db');
    const { personnel_id, device_id, active_only } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (personnel_id) {
      paramCount++;
      whereClause += ` AND a.personnel_id = $${paramCount}`;
      params.push(personnel_id);
    }

    if (device_id) {
      paramCount++;
      whereClause += ` AND a.device_id = $${paramCount}`;
      params.push(device_id);
    }

    if (active_only === 'true') {
      whereClause += ` AND (a.end_ts IS NULL OR a.end_ts > NOW())`;
    }

    const result = await pool.query(`
      SELECT a.*, 
             p.fname, p.lname, p.rank_rate, p.edipi,
             d.serial as device_serial, dm.vendor, dm.model,
             u.name as unit_name
      FROM radiation_assignments a
      LEFT JOIN radiation_personnel p ON a.personnel_id = p.id
      LEFT JOIN radiation_devices d ON a.device_id = d.id
      LEFT JOIN radiation_device_models dm ON d.model_id = dm.id
      LEFT JOIN radiation_units u ON p.unit_id = u.id
      ${whereClause}
      ORDER BY a.start_ts DESC
    `, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Assignments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments data' });
  }
});

// 13. Create device assignment
router.post('/assignments', async (req, res) => {
  try {
    const pool = require('../db');
    const { device_id, personnel_id, start_ts, end_ts, notes } = req.body;

    // Validate required fields
    if (!device_id || !personnel_id || !start_ts) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if device is already assigned to this personnel in the time period
    const existingAssignment = await pool.query(`
      SELECT id FROM radiation_assignments 
      WHERE device_id = $1 AND personnel_id = $2 
      AND (end_ts IS NULL OR end_ts > $3)
      AND (start_ts < COALESCE($4, NOW() + INTERVAL '1 year'))
    `, [device_id, personnel_id, start_ts, end_ts]);

    if (existingAssignment.rows.length > 0) {
      return res.status(409).json({ error: 'Device is already assigned to this personnel in the specified time period' });
    }

    // End any existing active assignments for this device
    await pool.query(`
      UPDATE radiation_assignments 
      SET end_ts = $1 
      WHERE device_id = $2 AND (end_ts IS NULL OR end_ts > $1)
    `, [start_ts, device_id]);

    // Create new assignment
    const result = await pool.query(`
      INSERT INTO radiation_assignments 
      (device_id, personnel_id, start_ts, end_ts, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id
    `, [device_id, personnel_id, start_ts, end_ts]);

    res.json({ 
      success: true, 
      assignment_id: result.rows[0].id,
      message: 'Device assignment created successfully'
    });

  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Failed to create device assignment' });
  }
});

// 14. Update device assignment
router.put('/assignments/:id', async (req, res) => {
  try {
    const pool = require('../db');
    const { id } = req.params;
    const { start_ts, end_ts, notes } = req.body;

    // Validate required fields
    if (!start_ts) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update assignment
    await pool.query(`
      UPDATE radiation_assignments 
      SET start_ts = $1, end_ts = $2
      WHERE id = $3
    `, [start_ts, end_ts, id]);

    res.json({ 
      success: true, 
      message: 'Device assignment updated successfully'
    });

  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Failed to update device assignment' });
  }
});

// 15. End device assignment
router.put('/assignments/:id/end', async (req, res) => {
  try {
    const pool = require('../db');
    const { id } = req.params;
    const { end_ts } = req.body;

    // End the assignment
    await pool.query(`
      UPDATE radiation_assignments 
      SET end_ts = COALESCE($1, NOW())
      WHERE id = $2
    `, [end_ts, id]);

    res.json({ 
      success: true, 
      message: 'Device assignment ended successfully'
    });

  } catch (error) {
    console.error('End assignment error:', error);
    res.status(500).json({ error: 'Failed to end device assignment' });
  }
});

// ===== NEW ENDPOINTS TO COMPLETE PHASE 1 =====

// 16. DELETE Personnel endpoint
router.delete('/personnel/:id', async (req, res) => {
  try {
    const pool = require('../db');
    const { id } = req.params;

    // Check if personnel has active assignments
    const activeAssignments = await pool.query(
      'SELECT COUNT(*) as count FROM radiation_assignments WHERE personnel_id = $1 AND (end_ts IS NULL OR end_ts > NOW())',
      [id]
    );

    if (activeAssignments.rows[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete personnel with active device assignments. End all assignments first.' 
      });
    }

    // Soft delete - mark as inactive instead of hard delete
    await pool.query(
      'UPDATE radiation_personnel SET active = false WHERE id = $1',
      [id]
    );

    res.json({ 
      success: true, 
      message: 'Personnel deactivated successfully'
    });

  } catch (error) {
    console.error('Delete personnel error:', error);
    res.status(500).json({ error: 'Failed to delete personnel' });
  }
});

// 17. Device CRUD endpoints
router.post('/devices', async (req, res) => {
  try {
    const pool = require('../db');
    const { model_id, serial, ble_mac, firmware, calib_due, rf_policy } = req.body;

    if (!model_id || !serial || !rf_policy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if serial already exists
    const existingDevice = await pool.query(
      'SELECT id FROM radiation_devices WHERE serial = $1',
      [serial]
    );

    if (existingDevice.rows.length > 0) {
      return res.status(409).json({ error: 'Device with this serial number already exists' });
    }

    const result = await pool.query(`
      INSERT INTO radiation_devices (model_id, serial, ble_mac, firmware, calib_due, rf_policy)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [model_id, serial, ble_mac, firmware, calib_due, rf_policy]);

    res.json({ 
      success: true, 
      device_id: result.rows[0].id,
      message: 'Device created successfully'
    });

  } catch (error) {
    console.error('Create device error:', error);
    res.status(500).json({ error: 'Failed to create device' });
  }
});

router.put('/devices/:id', async (req, res) => {
  try {
    const pool = require('../db');
    const { id } = req.params;
    const { model_id, serial, ble_mac, firmware, calib_due, rf_policy } = req.body;

    if (!model_id || !serial || !rf_policy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if serial already exists for other devices
    const existingDevice = await pool.query(
      'SELECT id FROM radiation_devices WHERE serial = $1 AND id != $2',
      [serial, id]
    );

    if (existingDevice.rows.length > 0) {
      return res.status(409).json({ error: 'Device with this serial number already exists' });
    }

    await pool.query(`
      UPDATE radiation_devices 
      SET model_id = $1, serial = $2, ble_mac = $3, firmware = $4, calib_due = $5, rf_policy = $6
      WHERE id = $7
    `, [model_id, serial, ble_mac, firmware, calib_due, rf_policy, id]);

    res.json({ success: true, message: 'Device updated successfully' });

  } catch (error) {
    console.error('Update device error:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

router.delete('/devices/:id', async (req, res) => {
  try {
    const pool = require('../db');
    const { id } = req.params;

    // Check if device has active assignments
    const activeAssignments = await pool.query(
      'SELECT COUNT(*) as count FROM radiation_assignments WHERE device_id = $1 AND (end_ts IS NULL OR end_ts > NOW())',
      [id]
    );

    if (activeAssignments.rows[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete device with active assignments. End all assignments first.' 
      });
    }

    // Soft delete - mark as retired
    await pool.query(
      'UPDATE radiation_devices SET retired_at = NOW() WHERE id = $1',
      [id]
    );

    res.json({ success: true, message: 'Device retired successfully' });

  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

// 18. Device Model CRUD endpoints
router.get('/device-models', async (req, res) => {
  try {
    const pool = require('../db');
    const result = await pool.query('SELECT * FROM radiation_device_models ORDER BY vendor, model');
    res.json(result.rows);
  } catch (error) {
    console.error('Device models fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch device models' });
  }
});

router.post('/device-models', async (req, res) => {
  try {
    const pool = require('../db');
    const { vendor, model, firmware_min, hp10_support, hp007_support, gatt_service_uuid, gatt_char_uuid } = req.body;

    if (!vendor || !model) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(`
      INSERT INTO radiation_device_models (vendor, model, firmware_min, hp10_support, hp007_support, gatt_service_uuid, gatt_char_uuid)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [vendor, model, firmware_min, hp10_support, hp007_support, gatt_service_uuid, gatt_char_uuid]);

    res.json({ 
      success: true, 
      model_id: result.rows[0].id,
      message: 'Device model created successfully'
    });

  } catch (error) {
    console.error('Create device model error:', error);
    res.status(500).json({ error: 'Failed to create device model' });
  }
});

// 19. Unit CRUD endpoints
router.post('/units', async (req, res) => {
  try {
    const pool = require('../db');
    const { uic, name, parent_uic } = req.body;

    if (!uic || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(`
      INSERT INTO radiation_units (uic, name, parent_uic)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [uic, name, parent_uic]);

    res.json({ 
      success: true, 
      unit_id: result.rows[0].id,
      message: 'Unit created successfully'
    });

  } catch (error) {
    console.error('Create unit error:', error);
    res.status(500).json({ error: 'Failed to create unit' });
  }
});

router.put('/units/:id', async (req, res) => {
  try {
    const pool = require('../db');
    const { id } = req.params;
    const { uic, name, parent_uic } = req.body;

    if (!uic || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await pool.query(`
      UPDATE radiation_units 
      SET uic = $1, name = $2, parent_uic = $3
      WHERE id = $4
    `, [uic, name, parent_uic, id]);

    res.json({ success: true, message: 'Unit updated successfully' });

  } catch (error) {
    console.error('Update unit error:', error);
    res.status(500).json({ error: 'Failed to update unit' });
  }
});

// 20. Alert management endpoints
router.post('/alerts', async (req, res) => {
  try {
    const pool = require('../db');
    const { type, severity, threshold, value, device_id, personnel_id, measured_ts, details } = req.body;

    if (!type || !severity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(`
      INSERT INTO radiation_alerts (type, severity, threshold, value, device_id, personnel_id, measured_ts, details)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [type, severity, threshold, value, device_id, personnel_id, measured_ts, details]);

    res.json({ 
      success: true, 
      alert_id: result.rows[0].id,
      message: 'Alert created successfully'
    });

  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

router.delete('/alerts/:id', async (req, res) => {
  try {
    const pool = require('../db');
    const { id } = req.params;

    await pool.query('DELETE FROM radiation_alerts WHERE id = $1', [id]);

    res.json({ success: true, message: 'Alert deleted successfully' });

  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

// 21. NDC (Naval Dosimetry Center) endpoints
router.get('/ndc-periods', async (req, res) => {
  try {
    const pool = require('../db');
    const result = await pool.query('SELECT * FROM radiation_ndc_periods ORDER BY period_start DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('NDC periods fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch NDC periods' });
  }
});

router.post('/ndc-periods', async (req, res) => {
  try {
    const pool = require('../db');
    const { period_start, period_end, ndc_source_doc } = req.body;

    if (!period_start || !period_end) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(`
      INSERT INTO radiation_ndc_periods (period_start, period_end, ndc_source_doc)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [period_start, period_end, ndc_source_doc]);

    res.json({ 
      success: true, 
      period_id: result.rows[0].id,
      message: 'NDC period created successfully'
    });

  } catch (error) {
    console.error('Create NDC period error:', error);
    res.status(500).json({ error: 'Failed to create NDC period' });
  }
});

// 22. Reconciliation endpoints
router.post('/reconciliations', async (req, res) => {
  try {
    const pool = require('../db');
    const { period_id, personnel_id, op_hp10_mSv, ndc_hp10_mSv, variance_mSv, details } = req.body;

    if (!period_id || !personnel_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(`
      INSERT INTO radiation_reconciliations (period_id, personnel_id, op_hp10_mSv, ndc_hp10_mSv, variance_mSv, details)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [period_id, personnel_id, op_hp10_mSv, ndc_hp10_mSv, variance_mSv, details]);

    res.json({ 
      success: true, 
      reconciliation_id: result.rows[0].id,
      message: 'Reconciliation created successfully'
    });

  } catch (error) {
    console.error('Create reconciliation error:', error);
    res.status(500).json({ error: 'Failed to create reconciliation' });
  }
});

// 23. Audit logging endpoints
router.get('/audit-log', async (req, res) => {
  try {
    const pool = require('../db');
    const { actor, action, obj_table, obj_id, start_date, end_date, limit = 100 } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (actor) {
      paramCount++;
      whereClause += ` AND actor = $${paramCount}`;
      params.push(actor);
    }

    if (action) {
      paramCount++;
      whereClause += ` AND action = $${paramCount}`;
      params.push(action);
    }

    if (obj_table) {
      paramCount++;
      whereClause += ` AND obj_table = $${paramCount}`;
      params.push(obj_table);
    }

    if (obj_id) {
      paramCount++;
      whereClause += ` AND obj_id = $${paramCount}`;
      params.push(obj_id);
    }

    if (start_date) {
      paramCount++;
      whereClause += ` AND ts >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      whereClause += ` AND ts <= $${paramCount}`;
      params.push(end_date);
    }

    const result = await pool.query(`
      SELECT * FROM radiation_audit_log
      ${whereClause}
      ORDER BY ts DESC
      LIMIT $${paramCount + 1}
    `, [...params, parseInt(limit)]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Audit log fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

// 24. Bulk operations endpoints
router.post('/bulk/assignments', async (req, res) => {
  try {
    const pool = require('../db');
    const { assignments } = req.body; // Array of assignment objects

    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({ error: 'Invalid assignments array' });
    }

    const results = [];
    for (const assignment of assignments) {
      const { device_id, personnel_id, start_ts, end_ts } = assignment;
      
      if (!device_id || !personnel_id || !start_ts) {
        results.push({ error: 'Missing required fields', assignment });
        continue;
      }

      try {
        // End any existing active assignments for this device
        await pool.query(`
          UPDATE radiation_assignments 
          SET end_ts = $1 
          WHERE device_id = $2 AND (end_ts IS NULL OR end_ts > $1)
        `, [start_ts, device_id]);

        // Create new assignment
        const result = await pool.query(`
          INSERT INTO radiation_assignments (device_id, personnel_id, start_ts, end_ts, created_at)
          VALUES ($1, $2, $3, $4, NOW())
          RETURNING id
        `, [device_id, personnel_id, start_ts, end_ts]);

        results.push({ 
          success: true, 
          assignment_id: result.rows[0].id,
          device_id, 
          personnel_id 
        });
      } catch (error) {
        results.push({ error: error.message, assignment });
      }
    }

    res.json({ 
      success: true, 
      results,
      message: 'Bulk assignments processed'
    });

  } catch (error) {
    console.error('Bulk assignments error:', error);
    res.status(500).json({ error: 'Failed to process bulk assignments' });
  }
});

// 25. Advanced search and filtering endpoints
router.get('/search/personnel', async (req, res) => {
  try {
    const pool = require('../db');
    const { query, unit_id, active, rank_rate, limit = 50 } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (query) {
      paramCount++;
      whereClause += ` AND (p.fname ILIKE $${paramCount} OR p.lname ILIKE $${paramCount} OR p.edipi ILIKE $${paramCount})`;
      params.push(`%${query}%`);
    }

    if (unit_id) {
      paramCount++;
      whereClause += ` AND p.unit_id = $${paramCount}`;
      params.push(unit_id);
    }

    if (active !== undefined) {
      paramCount++;
      whereClause += ` AND p.active = $${paramCount}`;
      params.push(active === 'true');
    }

    if (rank_rate) {
      paramCount++;
      whereClause += ` AND p.rank_rate = $${paramCount}`;
      params.push(rank_rate);
    }

    const result = await pool.query(`
      SELECT p.*, u.name as unit_name
      FROM radiation_personnel p
      LEFT JOIN radiation_units u ON p.unit_id = u.id
      ${whereClause}
      ORDER BY p.lname, p.fname
      LIMIT $${paramCount + 1}
    `, [...params, parseInt(limit)]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Personnel search error:', error);
    res.status(500).json({ error: 'Failed to search personnel' });
  }
});

router.get('/search/devices', async (req, res) => {
  try {
    const pool = require('../db');
    const { query, model_id, rf_policy, retired, limit = 50 } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (query) {
      paramCount++;
      whereClause += ` AND (d.serial ILIKE $${paramCount} OR dm.vendor ILIKE $${paramCount} OR dm.model ILIKE $${paramCount})`;
      params.push(`%${query}%`);
    }

    if (model_id) {
      paramCount++;
      whereClause += ` AND d.model_id = $${paramCount}`;
      params.push(model_id);
    }

    if (rf_policy) {
      paramCount++;
      whereClause += ` AND d.rf_policy = $${paramCount}`;
      params.push(rf_policy);
    }

    if (retired === 'true') {
      whereClause += ` AND d.retired_at IS NOT NULL`;
    } else if (retired === 'false') {
      whereClause += ` AND d.retired_at IS NULL`;
    }

    const result = await pool.query(`
      SELECT d.*, dm.vendor, dm.model, dm.hp10_support, dm.hp007_support
      FROM radiation_devices d
      LEFT JOIN radiation_device_models dm ON d.model_id = dm.id
      ${whereClause}
      ORDER BY d.serial
      LIMIT $${paramCount + 1}
    `, [...params, parseInt(limit)]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Device search error:', error);
    res.status(500).json({ error: 'Failed to search devices' });
  }
});

// 26. Health check endpoint for monitoring
router.get('/health', async (req, res) => {
  try {
    const pool = require('../db');
    
    // Test database connectivity
    const dbTest = await pool.query('SELECT 1 as test');
    
    // Check table counts
    const personnelCount = await pool.query('SELECT COUNT(*) as count FROM radiation_personnel');
    const devicesCount = await pool.query('SELECT COUNT(*) as count FROM radiation_devices');
    const readingsCount = await pool.query('SELECT COUNT(*) as count FROM radiation_dose_readings');
    
    res.json({
      status: 'healthy',
      database: 'connected',
      tables: {
        personnel: personnelCount.rows[0].count,
        devices: devicesCount.rows[0].count,
        readings: readingsCount.rows[0].count
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
