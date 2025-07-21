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

describe('Admin API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/admin/users/list', () => {
    it('should return a list of users when admin credentials are valid', async () => {
      const mockUsers = [{ id: 1, email: 'test@example.com' }];
      User.findByEmail.mockResolvedValue({ role: 'admin', password_hash: 'hashed_password' });
      bcrypt.compare.mockResolvedValue(true);
      User.findAll.mockResolvedValue(mockUsers);

      const res = await request(app)
        .post('/api/admin/users/list')
        .send({ adminEmail: 'admin@example.com', adminPassword: 'password' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockUsers);
    });

    it('should return 401 if admin credentials are invalid', async () => {
      User.findByEmail.mockResolvedValue({ role: 'admin', password_hash: 'hashed_password' });
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/admin/users/list')
        .send({ adminEmail: 'admin@example.com', adminPassword: 'wrong_password' });

      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toBe('Invalid admin credentials');
    });
  });

  describe('POST /api/admin/users', () => {
    it('should create a new user when admin credentials are valid', async () => {
      const newUser = { id: 2, email: 'new@example.com' };
      User.findByEmail.mockResolvedValueOnce({ role: 'admin', password_hash: 'hashed_password' }); // for checkAdmin
      bcrypt.compare.mockResolvedValue(true);
      User.findByEmail.mockResolvedValueOnce(null); // for checking if user exists
      User.create.mockResolvedValue(newUser);

      const res = await request(app)
        .post('/api/admin/users')
        .send({ adminEmail: 'admin@example.com', adminPassword: 'password', email: 'new@example.com', password: 'new_password' });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(newUser);
    });

    it('should return 400 if user already exists', async () => {
        User.findByEmail.mockResolvedValueOnce({ role: 'admin', password_hash: 'hashed_password' }); // for checkAdmin
        bcrypt.compare.mockResolvedValue(true);
        User.findByEmail.mockResolvedValueOnce({ id: 2, email: 'existing@example.com' }); // for checking if user exists

        const res = await request(app)
            .post('/api/admin/users')
            .send({ adminEmail: 'admin@example.com', adminPassword: 'password', email: 'existing@example.com', password: 'new_password' });

        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBe('User already exists');
    });
  });

  describe('PUT /api/admin/users/:id/password', () => {
    it('should update a user password when admin credentials are valid', async () => {
        User.findByEmail.mockResolvedValue({ role: 'admin', password_hash: 'hashed_password' });
        bcrypt.compare.mockResolvedValue(true);
        User.updatePassword.mockResolvedValue(1);

        const res = await request(app)
            .put('/api/admin/users/1/password')
            .send({ adminEmail: 'admin@example.com', adminPassword: 'password', newPassword: 'new_password' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Password updated successfully');
    });

    it('should return 404 if user not found', async () => {
        User.findByEmail.mockResolvedValue({ role: 'admin', password_hash: 'hashed_password' });
        bcrypt.compare.mockResolvedValue(true);
        User.updatePassword.mockResolvedValue(0);

        const res = await request(app)
            .put('/api/admin/users/999/password')
            .send({ adminEmail: 'admin@example.com', adminPassword: 'password', newPassword: 'new_password' });

        expect(res.statusCode).toEqual(404);
        expect(res.body.error).toBe('User not found');
    });
  });
});
