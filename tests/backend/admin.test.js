const request = require('supertest');
const express = require('express');
const adminRouter = require('../../server/routes/admin');
const User = require('../../server/models/userModel');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use('/api/admin', adminRouter);

jest.mock('../../server/models/userModel');
jest.mock('bcryptjs');

// helper to login and return a bearer token
async function getAdminToken() {
  const adminUser = { id: 1, email: 'admin@example.com', role: 'admin', password_hash: 'hashed_password' };
  User.findByEmail.mockResolvedValueOnce(adminUser);
  bcrypt.compare.mockResolvedValueOnce(true);
  User.updateLastLogin = jest.fn().mockResolvedValueOnce(1);

  const res = await request(app)
    .post('/api/admin/login')
    .send({ email: 'admin@example.com', password: 'password' });

  expect(res.statusCode).toBe(200);
  expect(res.body.token).toBeTruthy();
  return res.body.token;
}

describe('Admin API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/admin/users/list', () => {
    it('should return a list of users when admin JWT is valid', async () => {
      const token = await getAdminToken();
      const mockUsers = [{ id: 1, email: 'test@example.com' }];
      User.findAll.mockResolvedValue(mockUsers);

      const res = await request(app)
        .post('/api/admin/users/list')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockUsers);
    });

    it('should return 401 if missing token', async () => {
      const res = await request(app)
        .post('/api/admin/users/list')
        .send({});

      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toBe('Access token required');
    });
  });

  describe('POST /api/admin/users', () => {
    it('should create a new user when admin JWT is valid', async () => {
      const token = await getAdminToken();
      const newUser = { id: 2, email: 'new@example.com' };

      // Called during user creation to check if exists
      User.findByEmail.mockResolvedValueOnce(null);
      User.create.mockResolvedValue(newUser);

      const res = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'new@example.com', password: 'new_password' });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(newUser);
    });

    it('should return 400 if user already exists', async () => {
      const token = await getAdminToken();
      User.findByEmail.mockResolvedValueOnce({ id: 2, email: 'existing@example.com' });

      const res = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'existing@example.com', password: 'new_password' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('User already exists');
    });
  });

  describe('PUT /api/admin/users/:id/password', () => {
    it('should update a user password when admin JWT is valid', async () => {
      const token = await getAdminToken();
      User.updatePassword.mockResolvedValue(1);

      const res = await request(app)
        .put('/api/admin/users/1/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ newPassword: 'new_password' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Password updated successfully');
    });

    it('should return 404 if user not found', async () => {
      const token = await getAdminToken();
      User.updatePassword.mockResolvedValue(0);

      const res = await request(app)
        .put('/api/admin/users/999/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ newPassword: 'new_password' });

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toBe('User not found');
    });
  });
});
