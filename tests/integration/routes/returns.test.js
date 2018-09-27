const { Rental } = require('../../../models/rental')
const { User } = require('../../../models/user')
const mongoose = require('mongoose')
const request = require('supertest')
const moment = require('moment')

describe('/api/returns', () => {

  let server
  let customerId
  let movieId
  let rental
  let token

  beforeEach(async () => {
    server = require('../../../index')

    token = new User().generateAuthToken()

    customerId = mongoose.Types.ObjectId()
    movieId = mongoose.Types.ObjectId()

    rental = new Rental({
      customer: {
        _id: customerId,
        name: '12345',
        phone: '12345'
      },
      movie: {
        _id: movieId,
        title: 'movieTitle',
        dailyRentalRate: 2
      }
    })

    await rental.save()
  })
  afterEach(async () => {
    await Rental.remove({})
    await server.close()
  })

  const exec = () => {
    return request(server)
    .post('/api/returns')
    .set('x-auth-token', token)
    .send({ customerId, movieId })
  }

  it('should work', async () => {
    const result = await Rental.findById(rental._id)
    expect(result).not.toBeNull()
  })

  it('should return 401 is client is not logged in', async () => {
    token = ''
    const res = await exec()

    expect(res.status).toBe(401)
  })

  it('should return 400 if customer id is not provided', async () => {
    customerId = null
    const res = await exec()

    expect(res.status).toBe(400)
  })

  it('should return 400 if movieId is not provided', async () => {
    movieId = null
    const res = await exec()

    expect(res.status).toBe(400)
  })

  it('should return 404 if there is no rental for this customer/movie combo', async () => {
    await Rental.remove({})

    const res = await exec()

    expect(res.status).toBe(404)
  })

  it('should return 400 if return is already processed', async () => {
    rental.dateReturned = new Date()
    await rental.save()
    const res = await exec()

    expect(res.status).toBe(400)
  })

  it('should return 200 if we have a valid request', async () => {
    const res = await exec()

    expect(res.status).toBe(200)
  })

  it('should set returned dat if input is valid', async () => {
    const res = await exec()

    const rentalInDb = await Rental.findById(rental._id)
    const diff = new Date() - rentalInDb.dateReturned
    expect(diff).toBeLessThan(10 * 1000)
  })

  it('should calculate the rental fee', async () => {
    rental.dateOut = moment().add(-7, 'days').toDate()

    await rental.save()

    const res = await exec()

    const rentalInDb = await Rental.findById(rental._id)
    expect(rentalInDb.rentalFee).toBeDefined()
  })
})