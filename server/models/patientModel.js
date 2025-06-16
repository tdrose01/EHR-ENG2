const pool = require('../db')

async function updatePatient(id, data) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await client.query(
      `UPDATE patients SET
        first_name = $1,
        last_name = $2,
        gender = $3,
        marital_status = $4,
        blood_type = $5,
        rh_factor = $6,
        duty_status = $7,
        pid = $8,
        paygrade = $9,
        branch_of_service = $10,
        ethnicity = $11,
        religion = $12,
        dod_id = $13,
        date_of_birth = $14,
        phone_number = $15,
        is_active = $16
      WHERE id = $17 RETURNING *`,
      [
        data.first_name,
        data.last_name,
        data.gender,
        data.marital_status,
        data.blood_type,
        data.rh_factor,
        data.duty_status,
        data.pid,
        data.paygrade,
        data.branch_of_service,
        data.ethnicity,
        data.religion,
        data.dod_id,
        data.date_of_birth,
        data.phone_number,
        data.is_active,
        id
      ]
    )
    await client.query('COMMIT')
    return result.rows[0]
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

module.exports = { updatePatient }
