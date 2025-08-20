// (Using a test setup with supertest and jest)
describe('Pop8 API Endpoints', () => {

  // Example of a GET test
  it('should retrieve data successfully', async () => {
    const res = await request(app)
      .get('/api/pop8')
      .set('Authorization', `Bearer validToken`);
      
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  // Example of a POST validation error test
  it('should fail to create data with invalid input', async () => {
    const res = await request(app)
      .post('/api/pop8')
      .set('Authorization', `Bearer validToken`)
      .send({ invalidField: "invalidValue" });
      
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  // Example of a DELETE unauthorized access test
  it('should deny access on delete without token', async () => {
    const res = await request(app)
      .delete('/api/pop8/1');
    
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error');
  });

});
