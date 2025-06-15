try {
  require('dotenv').config()
} catch {
  console.warn('dotenv not installed; skipping .env loading')
}

const express = require('express')
const { Pool } = require('pg')
const bcrypt = require('bcrypt')

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const result = await pool.query(
      'SELECT id, password_hash FROM users WHERE email = $1',
      [email]
    )
    if (result.rows.length === 0) {
      await pool.query('INSERT INTO login_audit (action) VALUES ($1)', ['login_failed'])
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }
    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    const action = valid ? 'login_success' : 'login_failed'
    await pool.query('INSERT INTO login_audit (user_id, action) VALUES ($1, $2)', [user.id, action])
    if (valid) {
      res.json({ success: true })
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' })
    }
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false })
  }
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
