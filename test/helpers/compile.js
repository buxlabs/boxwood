const { compile } = require('../..')

module.exports = async function (source, options) {
  return compile(source, {
    compact: 'collapsed',
    compiler: 'any',
    ...options
  }).then((output) => {
    if (process.env.DEBUG === 'boxwood') {
      const { template, warnings, errors } = output
      console.log(template.toString())
      if (warnings.length > 0) { console.log(warnings) }
      if (errors.length > 0) { console.log(errors) }
    }
    return output
  })
}
