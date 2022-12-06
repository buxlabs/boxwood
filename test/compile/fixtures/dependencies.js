const { join } = require('path')
const literal = require('./literal')

module.exports = () => join(literal(), 'bar')
