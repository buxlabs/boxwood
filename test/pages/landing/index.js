const layout = require('./layout/default')
const button = require('./components/button')

module.exports = () => layout([
  button(
    'Hello, world!'
  )
])
