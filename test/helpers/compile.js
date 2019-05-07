const { compile } = require('../..')

module.exports = async function () {
  return compile.apply(this, arguments).then(({ template, statistics, errors, warnings }) => {
    if (errors.length > 0) {
      throw errors[0]
    }
    return { template, statistics, errors, warnings }
  })
}
