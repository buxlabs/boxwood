const layout = require('./layouts/default')
const button = require('./components/button')

module.exports = () => layout([
  button({}, 'Sign In'),
  button({}, 'Sign Up')
])
