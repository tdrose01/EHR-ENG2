const request = require('supertest');
const assert = require('assert');
const express = require('express');
const createTestTableRouter = require('../src/api/create_test_table');

describe('create test table', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use('/api', createTestTableRouter);
  });

  it('should return 200 from the create_test_table endpoint', (done) => {
    request(app)
      .get('/api/create_test_table')
      .expect(200, done);
  });
});