const express = require('express')
const { Pool } = require('pg')

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
      'SELECT id FROM users WHERE email = $1 AND password = $2',
      [email, password]
    )
    if (result.rows.length > 0) {
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
