
const request = require('supertest');
const app = require('../../server/index'); // Adjust this path if your app entry is elsewhere

describe('GET /api/hello', () => {
  it('should return a hello message', async () => {
    const response = await request(app)
      .get('/api/hello')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({ message: 'Hello from the new endpoint!' });
  });
});
