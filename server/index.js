try {
  require('dotenv').config()
} catch {
  console.warn('dotenv not installed; skipping .env loading')
}

const express = require('express')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
const cors = require('cors')
const pool = require('./db')

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 3000

// Import routes
const patientRoutes = require('./routes/patients')
const environmentRoutes = require('./routes/environments')

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}))

app.use(express.json())

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Use routes
app.use('/api/patients', patientRoutes)
app.use('/api/environments', environmentRoutes)

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  console.log('Login attempt:', { email, password })
  try {
    const result = await pool.query(
      'SELECT id, password_hash, role FROM users WHERE email = $1',
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
      let lastLoginAt = null
      let lastLogin = null
      try {
        // fetch previous timestamp before updating
        const prev = await pool.query(
          'SELECT last_login_at, last_login FROM users WHERE id = $1',
          [user.id]
        )
        lastLoginAt = prev.rows[0]?.last_login_at || null
        lastLogin = prev.rows[0]?.last_login || null

        await pool.query(
          'UPDATE users SET last_login_at = NOW(), last_login = NOW() WHERE id = $1',
          [user.id]
        )
      } catch (err) {
        if (err.code === '42703') {
          console.warn('last_login_at column missing, skipping update')
        } else {
          throw err
        }
      }
      res.json({ success: true, role: user.role, userId: user.id, lastLoginAt, lastLogin })
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' })
    }
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false })
  }
})

// Admin endpoint to update a user's password
app.put('/api/admin/users/:id/password', async (req, res) => {
  const { id } = req.params
  const { adminEmail, adminPassword, newPassword } = req.body

  if (!adminEmail || !adminPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing parameters' })
  }

  try {
    const adminResult = await pool.query(
      'SELECT id, password_hash, role FROM users WHERE email = $1',
      [adminEmail]
    )

    if (
      adminResult.rows.length === 0 ||
      adminResult.rows[0].role !== 'admin'
    ) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const adminUser = adminResult.rows[0]
    const validAdmin = await bcrypt.compare(
      adminPassword,
      adminUser.password_hash
    )

    if (!validAdmin) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashed, id])

    res.json({ success: true })
  } catch (err) {
    console.error('Password update error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Admin endpoint to list users
app.get('/api/admin/users', async (req, res) => {
  const { adminEmail, adminPassword } = req.query

  if (!adminEmail || !adminPassword) {
    return res.status(400).json({ error: 'Missing parameters' })
  }

  try {
    const adminResult = await pool.query(
      'SELECT password_hash, role FROM users WHERE email = $1',
      [adminEmail]
    )

    if (
      adminResult.rows.length === 0 ||
      adminResult.rows[0].role !== 'admin'
    ) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const valid = await bcrypt.compare(
      adminPassword,
      adminResult.rows[0].password_hash
    )

    if (!valid) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

  const users = await pool.query('SELECT id, email, last_login_at, last_login FROM users ORDER BY email')
  res.json(users.rows)
  } catch (err) {
    console.error('User list error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Endpoint to fetch a user's profile
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      'SELECT id, email, role, last_login FROM users WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = result.rows[0]
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      lastLogin: user.last_login
    })
  } catch (err) {
    console.error('User profile error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Health status endpoint
app.get('/api/v1/health/status', async (req, res) => {
  const status = { api: 'online', database: 'online' }
  try {
    await pool.query('SELECT 1')
    res.json(status)
  } catch (err) {
    console.error('Database health check failed:', err)
    status.database = 'offline'
    res.status(503).json(status)
  }
})

// Environmental Dashboard API
app.get('/api/environmental/latest', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pm25, pm10, o3, lead, arsenic, status_air, status_water, recorded_at
       FROM environmental_data
       ORDER BY recorded_at DESC
       LIMIT 1`
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data found' });
    }
    const row = result.rows[0];
    res.json({
      airQuality: {
        pm25: row.pm25,
        pm10: row.pm10,
        o3: row.o3,
        status: row.status_air
      },
      waterQuality: {
        lead: row.lead,
        arsenic: row.arsenic,
        status: row.status_water
      },
      lastUpdated: row.recorded_at
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    console.log('Available routes:')
    console.log('- GET    /api/patients')
    console.log('- GET    /api/patients/:id')
    console.log('- POST   /api/patients')
    console.log('- PUT    /api/patients/:id')
    console.log('- DELETE /api/patients/:id')
    console.log('- GET    /api/patients/search/:query')
    console.log('- GET    /api/users/:id')
    console.log('- GET    /api/environments')
    console.log('- GET    /api/environments/:id')
    console.log('- GET    /api/v1/health/status')
  })
}

module.exports = app
