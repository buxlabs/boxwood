const { compile } = require('../..')

module.exports = async function () {
  return compile.apply(this, arguments).then(({ template, statistics, errors, warnings }) => {
    if (process.env.DEBUG === 'pure-engine') {
      console.log(template.toString())
    }
    return { template, statistics, errors, warnings }
  })
}
