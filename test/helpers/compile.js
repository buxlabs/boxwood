const { compile } = require('../..')

module.exports = function () {
  return compile.apply(this, arguments).code
}
