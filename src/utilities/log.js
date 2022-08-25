const colors = require('ansi-colors')

module.exports = {
  print: function print ({ path, errors, log }) {
    log = typeof log === 'function' ? log : console.log
    const error = message => log(colors.red.bold(message))
    const dashes = '-'.repeat(50)
    if (errors.length > 0) {
      log(`boxwood: ${errors.length} errors - ${path}`)
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
