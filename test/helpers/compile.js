const { compile } = require('../..')

module.exports = function () {
  return compile.apply(this, arguments).then(result => {
    return result.code
  })
}
