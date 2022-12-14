const { label } = require('../../..')

module.exports = ({ className, htmlFor }, children) => {
  return label({ className, htmlFor }, children)
}
