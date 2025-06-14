const url = 'http://localhost:3000/api/login'
const email = process.env.TEST_EMAIL
const password = process.env.TEST_PASSWORD

if (!email || !password) {
  console.error('Please set TEST_EMAIL and TEST_PASSWORD.')
  process.exit(1)
}

async function run() {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  console.log('Status:', res.status)
  const data = await res.json()
  console.log('Response:', data)
}

run().catch(err => {
  console.error('Login request failed:', err)
  process.exit(1)
})
