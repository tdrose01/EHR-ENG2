try {
  require('dotenv').config()
} catch {
  console.warn('dotenv not installed; skipping .env loading')
}

const url = process.env.PATIENTS_URL || 'http://localhost:3000/api/patients'

async function run() {
  const res = await fetch(url)
  console.log('Status:', res.status)
  const data = await res.json()
  console.log('Patients:', data)
}

run().catch(err => {
  console.error('Patient request failed:', err)
  process.exit(1)
})

