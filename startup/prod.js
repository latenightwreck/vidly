const helmet = require('helmet')
const compression = require('helmet')

module.exports = function(app) {
  app.use(helmet())
  app.use(compression())
}