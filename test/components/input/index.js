const { Input } = require('../../..')

module.exports = ({ value, min, max, disabled, placeholder }) => {
  return Input({ value, min, max, disabled, placeholder })
}
