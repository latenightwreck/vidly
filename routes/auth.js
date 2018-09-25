const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const _ = require('lodash')
const bcrypt = require('bcrypt')
const Joi = require('joi')
const asyncMiddleware = require('../middleware/async')

router.post('/', asyncMiddleware (async (req, res) => {
  const { error } = validate(req.body)
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email })
  if (!user) return res.status(400).send('Invalid email or password')

  const validPassword = await bcrypt.compare(req.body.password, user.password)
  if (!validPassword) return res.status(400).send('Invalid email or password')

  const token = user.generateAuthToken()

  res.send(token)
}))


function validate(req) {
  const schema = {
    email: Joi.string().required().min(5).max(255).email(),
    password: Joi.string().required()
  }

  return Joi.validate(req, schema)
}

module.exports = router