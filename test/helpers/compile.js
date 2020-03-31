const { compile } = require('../..')

module.exports = async function (source, options) {
  return compile(source, { compact: true, ...options }).then(({ template, statistics, errors, warnings, from }) => {
    if (process.env.DEBUG === 'boxwood') {
      console.log(template.toString())
      if (warnings.length > 0) { console.log(warnings) }
      if (errors.length > 0) { console.log(errors) }
    }
    return { template, statistics, errors, warnings, from }
  })
}
