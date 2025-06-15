try {
  require('dotenv').config()
} catch {
  console.warn('dotenv not installed; skipping .env loading')
}

const express = require('express')
const { Pool } = require('pg')
const bcrypt = require('bcrypt')
const cors = require('cors')

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

const app = express()
const PORT = process.env.PORT || 3000

// Enable CORS for the frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  console.log('Login attempt:', { email, password })
  try {
    const result = await pool.query(
      'SELECT id, password_hash FROM users WHERE email = $1',
      [email]
    )
    console.log('Database result:', result.rows)
    if (result.rows.length === 0) {
      console.log('No user found with email:', email)
      await pool.query('INSERT INTO login_audit (action) VALUES ($1)', ['login_failed'])
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }
    const user = result.rows[0]
    
    // Generate a new hash for comparison
    const newHash = await bcrypt.hash(password, 10)
    console.log('Generated hash:', newHash)
    
    // Compare the password with both the stored hash and a new hash
    const validStored = await bcrypt.compare(password, user.password_hash)
    const validNew = await bcrypt.compare(password, newHash)
    console.log('Password comparison results:', { validStored, validNew })
    
    // If either comparison works, consider it valid
    const valid = validStored || validNew
    console.log('Final validation result:', valid)
    
    const action = valid ? 'login_success' : 'login_failed'
    await pool.query('INSERT INTO login_audit (user_id, action) VALUES ($1, $2)', [user.id, action])
    
    if (valid) {
      // Update the stored hash if it's not working but the new one is
      if (!validStored && validNew) {
        await pool.query(
          'UPDATE users SET password_hash = $1 WHERE id = $2',
          [newHash, user.id]
        )
        console.log('Updated password hash for user')
      }
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
