const { User } = require('../../../models/user')
const request = require('supertest')

let server

describe('auth middleware', () => {

  let token

  beforeEach(() => {
    server = require('../../../index')
    token = new User().generateAuthToken()
  })
  afterEach(async () => {
    await server.close()
  })

  const exec = () => {
    return request(server)
      .post('/api/genres')
      .set('x-auth-token', token)
      .send({ name: 'genre1' })
  }

  it('should return 401 if no token is provided', async () => {
    token = ''
    const res = await exec()
    expect(res.status).toBe(401)
  })
})