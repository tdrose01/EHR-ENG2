const request = require('supertest')
const express = require('express')
const patientsRouter = require('../../server/routes/patients')
const pool = require('../../server/db')

const app = express()
app.use(express.json())
app.use('/api/patients', patientsRouter)

describe('Patient API', () => {
  let testPatientPid

  afterAll(async () => {
    if (testPatientPid) {
      await pool.query('DELETE FROM patients WHERE pid = $1', [testPatientPid])
    }
    pool.end()
  })

  it('should create a new patient with a date of birth', async () => {
    const patientData = {
      first_name: 'John',
      last_name: 'Doe',
      gender: 'Male',
      blood_type: 'O+',
      rh_factor: 'Positive',
      duty_status: 'Active',
      pid: `test-${Date.now()}`, // Unique PID
      paygrade: 'E5',
      branch_of_service: 'Army',
      ethnicity: 'Caucasian',
      religion: 'None',
      dod_id: Date.now(), // Unique DOD ID
      date_of_birth: '1990-01-01',
      phone_number: '123-456-7890',
      is_active: true
    }
    testPatientPid = patientData.pid

    const response = await request(app)
      .post('/api/patients')
      .send(patientData)

    expect(response.statusCode).toBe(201)
    expect(response.body.date_of_birth).toBe('1990-01-01T05:00:00.000Z')
  })
})