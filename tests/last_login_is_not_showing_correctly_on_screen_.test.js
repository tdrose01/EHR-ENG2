const request = require('supertest');
const assert = require('assert');
const express = require('express');
const lastLoginRouter = require('../src/api/last_login_is_not_showing_correctly_on_screen_');

describe('last login is not showing correctly on screen.', () => {
  let app;
  let db;

  beforeAll(() => {
    app = express();
    app.use('/api', lastLoginRouter);
  });

  it('should return 200 from the last_login_is_not_showing_correctly_on_screen_ endpoint', (done) => {
    request(app)
      .get('/api/last_login_is_not_showing_correctly_on_screen_')
      .expect(200, done);
  });
});