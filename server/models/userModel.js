const db = require('../db');
const bcrypt = require('bcryptjs');

const User = {
  async create(email, password, role = 'user') {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const { rows } = await db.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, passwordHash, role]
    );
    return rows[0];
  },

  async findAll() {
    const { rows } = await db.query('SELECT id, email, role, last_login FROM users ORDER BY id DESC');
    return rows;
  },

  async findById(id) {
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0];
  },

  async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    const { rowCount } = await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, id]);
    return rowCount;
  },

  async updateRole(id, newRole) {
    const { rowCount } = await db.query('UPDATE users SET role = $1 WHERE id = $2', [newRole, id]);
    return rowCount;
  },

  async deleteUser(id) {
    const { rowCount } = await db.query('DELETE FROM users WHERE id = $1', [id]);
    return rowCount;
  },

  async findByEmail(email) {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  },

  async getRoles() {
    const { rows } = await db.query("SELECT DISTINCT role FROM users ORDER BY role");
    return rows.map(row => row.role);
  },

  async updateLastLogin(id) {
    const { rowCount } = await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [id]
    );
    return rowCount;
  }
};

module.exports = User;
