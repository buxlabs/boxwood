const { input } = require('../../..')

module.exports = ({ value, min, max, disabled, placeholder }) => {
  return input({ value, min, max, disabled, placeholder })
}
