const request = require('supertest');
const assert = require('assert');
const { initializeApp } = require('../src/api/server');

describe('last login is not showing correctly on screen.', () => {
  let app;
  let db;

  before(async () => {
    const initialized = await initializeApp();
    app = initialized.app;
    db = initialized.db;
  });

  it('should return 200 from the last_login_is_not_showing_correctly_on_screen_ endpoint', (done) => {
    request(app)
      .get('/api/last_login_is_not_showing_correctly_on_screen_')
      .expect(200, done);
  });
});