const request = require('supertest');
const assert = require('assert');
const { initializeApp } = require('../src/api/server');

describe('create test table', () => {
  let app;
  let db;

  before(async () => {
    const initialized = await initializeApp();
    app = initialized.app;
    db = initialized.db;
  });

  it('should return 200 from the create_test_table endpoint', (done) => {
    request(app)
      .get('/api/create_test_table')
      .expect(200, done);
  });
});