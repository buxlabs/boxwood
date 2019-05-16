const { compile } = require('../..')

module.exports = async function () {
  return compile.apply(this, arguments).then(({ template, statistics, errors, warnings }) => {
    return { template, statistics, errors, warnings }
  })
}
