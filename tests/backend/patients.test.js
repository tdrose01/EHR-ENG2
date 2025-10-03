const request = require('supertest')
const express = require('express')
const patientsRouter = require('../../server/routes/patients')
const pool = require('../../server/db')

const app = express()
app.use(express.json())
app.use('/api/patients', patientsRouter)

describe('Patient API', () => {
  let testPatient;

  beforeAll(async () => {
    // Create a patient to be used in tests
    const patientData = {
      first_name: 'Test',
      last_name: 'Patient',
      gender: 'Other',
      blood_type: 'B+',
      rh_factor: 'Positive',
      duty_status: 'Reserve',
      pid: `test-main-${Date.now()}`,
      paygrade: 'O1',
      branch_of_service: 'Space Force',
      ethnicity: 'Other',
      religion: 'Other',
      dod_id: Date.now(),
      date_of_birth: '2000-01-01',
      phone_number: '555-555-5555',
      is_active: true,
      occ_code: 21
    };
    const response = await request(app)
      .post('/api/patients')
      .send(patientData);
    testPatient = response.body;
  });

  afterAll(async () => {
    if (testPatient) {
      await pool.query('DELETE FROM patients WHERE id = $1', [testPatient.id]);
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
      is_active: true,
      occ_code: 10
    }

    const response = await request(app)
      .post('/api/patients')
      .send(patientData)

    expect(response.statusCode).toBe(201)
    expect(response.body.date_of_birth).toBe('1990-01-01T05:00:00.000Z')
    expect(response.body.occ_code).toBe(10)

    // Clean up the created patient
    await pool.query('DELETE FROM patients WHERE id = $1', [response.body.id]);
  })

  it('should not create a new patient with missing required fields', async () => {
    const patientData = {
      // first_name is missing
      last_name: 'Doe',
      date_of_birth: '1990-01-01',
      occ_code: 10
    }

    const response = await request(app)
      .post('/api/patients')
      .send(patientData)

    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('First name, last name, and date of birth are required.')
  });

  it('should require an OCC code when creating a patient', async () => {
    const patientData = {
      first_name: 'Alex',
      last_name: 'NoOcc',
      gender: 'Other',
      blood_type: 'A+',
      rh_factor: 'Positive',
      duty_status: 'Active',
      pid: `test-missing-occ-${Date.now()}`,
      paygrade: 'E5',
      branch_of_service: 'Army',
      ethnicity: 'Other',
      religion: 'None',
      dod_id: Date.now(),
      date_of_birth: '1991-02-02',
      phone_number: '555-222-3333',
      is_active: true
    }

    const response = await request(app)
      .post('/api/patients')
      .send(patientData)

    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('OCC code must be a valid number.')
  })

  it('should reject an unknown OCC code', async () => {
    const patientData = {
      first_name: 'Sam',
      last_name: 'InvalidOcc',
      gender: 'Male',
      blood_type: 'B+',
      rh_factor: 'Negative',
      duty_status: 'Reserve',
      pid: `test-invalid-occ-${Date.now()}`,
      paygrade: 'O2',
      branch_of_service: 'Navy',
      ethnicity: 'Other',
      religion: 'None',
      dod_id: Date.now(),
      date_of_birth: '1993-03-03',
      phone_number: '555-333-4444',
      is_active: true,
      occ_code: 99
    }

    const response = await request(app)
      .post('/api/patients')
      .send(patientData)

    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('OCC code is not recognized.')
  })

  it('should update a patient', async () => {
    const updatedData = {
        ...testPatient,
        first_name: 'Updated',
        last_name: 'Patient',
    };

    const response = await request(app)
        .put(`/api/patients/${testPatient.id}`)
        .send(updatedData);

    expect(response.statusCode).toBe(200);
    expect(response.body.first_name).toBe('Updated');
  });

  it('should not update a patient with an invalid DoD ID', async () => {
    const updatedData = {
        ...testPatient,
        dod_id: 'not-a-number',
    };

    const response = await request(app)
        .put(`/api/patients/${testPatient.id}`)
        .send(updatedData);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('DoD ID must be a number.');
  });

  it('should delete a patient', async () => {
    // First, create a patient to delete
    const patientData = {
      first_name: 'Jane',
      last_name: 'Doe',
      gender: 'Female',
      blood_type: 'A+',
      rh_factor: 'Positive',
      duty_status: 'Active',
      pid: `test-delete-${Date.now()}`,
      paygrade: 'E5',
      branch_of_service: 'Navy',
      ethnicity: 'Hispanic',
      religion: 'None',
      dod_id: Date.now(),
      date_of_birth: '1992-02-02',
      phone_number: '098-765-4321',
      is_active: true,
      occ_code: 11
    }

    const createResponse = await request(app)
      .post('/api/patients')
      .send(patientData)
    
    const patientId = createResponse.body.id

    // Now, delete the patient
    const deleteResponse = await request(app)
      .delete(`/api/patients/${patientId}`)
    
    expect(deleteResponse.statusCode).toBe(200)
    expect(deleteResponse.body.message).toBe('Patient deleted successfully')

    // Verify the patient is actually deleted
    const getResponse = await request(app)
      .get(`/api/patients/${patientId}`)
    
    expect(getResponse.statusCode).toBe(404)
  })
})