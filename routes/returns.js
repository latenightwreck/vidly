const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');
const express = require('express')
const router = express.Router();
const auth = require('../middleware/auth')
const Joi = require('joi')
const validate = require('../middleware/validate')

router.post('/', [auth, validate(validateReturn)], async (req, res) => {
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId)

  if (!rental) return res.status(404).send('Rental not found.')
  if (rental.dateReturned) return res.status(400).send('Rental has been returned.')

  rental.return()

  await Movie.update({ _id: rental.movie._id}, {
    $inc: { numberInStock: 1 }
  })
  await rental.save()

  return res.status(200).send(rental)
});

function validateReturn(request) {
  const schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  }

  return Joi.validate(request, schema)
}

module.exports = router;