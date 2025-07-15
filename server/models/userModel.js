const db = require('../db');
const bcrypt = require('bcryptjs');

const User = {
  async findAll() {
    const { rows } = await db.query('SELECT id, email FROM users');
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

  async findByEmail(email) {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  }
};

module.exports = User;
