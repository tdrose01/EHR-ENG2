const pool = require('../db')

async function createWaterTest(patientId, { lead, arsenic, status }) {
  const result = await pool.query(
    `INSERT INTO patient_water_tests (patient_id, lead, arsenic, status)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [patientId, lead, arsenic, status]
  )
  return result.rows[0]
}

async function getWaterTests(patientId) {
  const result = await pool.query(
    'SELECT * FROM patient_water_tests WHERE patient_id = $1 ORDER BY recorded_at DESC',
    [patientId]
  )
  return result.rows
}

module.exports = { createWaterTest, getWaterTests }
