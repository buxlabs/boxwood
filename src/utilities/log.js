const colors = require('ansi-colors')

module.exports = {
  print: function print ({ path, warnings, errors, log }) {
    log = typeof log === 'function' ? log : console.log
    const warn = message => log(colors.yellow.bold(message))
    const error = message => log(colors.red.bold(message))
    const dashes = '-'.repeat(50)
    if (warnings.length > 0 || errors.length > 0) {
      log(`boxwood: ${warnings.length} warnings, ${errors.length} errors - ${path}`)
    }
    if (warnings.length > 0) {
      warnings.forEach(({ type, message }) => {
        warn(`Warning\n${dashes}`)
        warn(`type: ${type}`)
        warn(`message: ${message}`)
        warn(`${dashes}\n`)
      })
      warn(`Total warnings: ${warnings.length}`)
    }
    if (errors.length > 0) {
      errors.forEach(({ type, message }) => {
        error(`Error\n${dashes}`)
        error(`type: ${type}`)
        error(`message: ${message}`)
        error(`${dashes}\n`)
      })
      error(`Total errors: ${errors.length}`)
    }
  }
}
