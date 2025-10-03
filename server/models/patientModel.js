const pool = require('../db')

async function updatePatient(id, {
  first_name,
  last_name,
  gender,
  blood_type,
  rh_factor,
  duty_status,
  pid,
  paygrade,
  branch_of_service,
  ethnicity,
  religion,
  dod_id,
  date_of_birth,
  phone_number,
  is_active,
  occ_code
}) {
  const result = await pool.query(
    `UPDATE patients SET
      first_name = $1,
      last_name = $2,
      gender = $3,
      blood_type = $4,
      rh_factor = $5,
      duty_status = $6,
      pid = $7,
      paygrade = $8,
      branch_of_service = $9,
      ethnicity = $10,
      religion = $11,
      dod_id = $12,
      date_of_birth = $13,
      phone_number = $14,
      is_active = $15,
      occ_code = $16
    WHERE id = $17 RETURNING *`,
    [
      first_name,
      last_name,
      gender,
      blood_type,
      rh_factor,
      duty_status,
      pid,
      paygrade,
      branch_of_service,
      ethnicity,
      religion,
      dod_id,
      date_of_birth,
      phone_number,
      is_active,
      occ_code,
      id
    ]
  )

  return result.rows[0] || null
}

module.exports = { updatePatient }
