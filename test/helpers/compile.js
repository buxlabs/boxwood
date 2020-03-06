const { compile } = require('../..')

module.exports = async function () {
  return compile.apply(this, arguments).then(({ template, statistics, errors, warnings }) => {
    if (process.env.DEBUG === 'pure-engine') {
      console.log(template.toString())
      if (warnings.length > 0) { console.log(warnings) }
      if (errors.length > 0) { console.log(errors) }
    }
    return { template, statistics, errors, warnings }
  })
}
