const request = require('supertest');
const app = require('../app');

describe('CRUD Operations for Fred', () => {
  const validFredData = { name: 'Test Fred', value: 100 };
  let testToken = 'VALID_JWT_TOKEN';  // Replace with a method to get a valid token during actual testing.

  it('should create a fred entry with valid input', async () => {
    const res = await request(app)
      .post('/api/fred')
      .set('Authorization', `Bearer ${testToken}`)
      .send(validFredData);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should not create a fred entry with invalid input', async () => {
    const res = await request(app)
      .post('/api/fred')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ name: '' }); // Invalid input example
    expect(res.statusCode).toEqual(400);
  });

  it('should read all fred entries', async () => {
    const res = await request(app)
      .get('/api/fred')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should update a fred entry with valid input', async () => {
    const newData = { name: 'Updated Fred', value: 200 };
    const res = await request(app)
      .put('/api/fred/1')  // Replace with an existing ID
      .set('Authorization', `Bearer ${testToken}`)
      .send(newData);
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual(newData.name);
  });

  it('should delete a fred entry', async () => {
    const res = await request(app)
      .delete('/api/fred/1')  // Replace with an existing ID
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.statusCode).toEqual(204);
  });

  it('should return an error with an invalid JWT token', async () => {
    const res = await request(app)
      .get('/api/fred')
      .set('Authorization', `Bearer INVALID_JWT`);
    expect(res.statusCode).toEqual(401);
  });
});
