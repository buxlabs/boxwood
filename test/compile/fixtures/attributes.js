const { Label } = require('../../..')

module.exports = ({ className, htmlFor }, children) => {
  return Label({ className, htmlFor }, children)
}
