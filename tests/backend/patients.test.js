const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
const request = require('supertest')

jest.mock('../../server/db', () => ({
  query: jest.fn()
}))

const pool = require('../../server/db')
const app = require('../../server/index')

describe('POST /api/patients', () => {
  it('stores branch_of_service', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1, branch_of_service: 'Army' }] })
    const res = await request(app)
      .post('/api/patients')
      .send({ first_name: 'John', last_name: 'Doe', branch_of_service: 'Army' })
    expect(pool.query).toHaveBeenCalled()
    expect(res.body.branch_of_service).toBe('Army')
  })
})
