const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const config = require('config')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
    maxlength: 255
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: Boolean
})

userSchema.methods.generateAuthToken = function() {
  const token =  jwt.sign({ 
    _id: this.id,
    isAdmin: this.isAdmin
   }, config.get('jwtPrivateKey'))
  return token
}

const User = mongoose.model('User', userSchema)

function validateUser(user) {
  const schema = {
    name: Joi.string().required().min(5).max(100),
    email: Joi.string().required().min(5).max(255).email(),
    password: Joi.string().required()
  }

  return Joi.validate(user, schema)
}

exports.User = User
exports.validate = validateUser