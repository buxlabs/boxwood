const test = require('ava')
const colors = require('ansi-colors')
const verbose = process.env.VERBOSE

module.exports = function (description, callback) {
  test(description, async assert => {
    if (verbose) {
      console.time(colors.yellowBright(description))
    }
    await callback(assert)
    if (verbose) {
      console.timeEnd(colors.yellowBright(description))
    }
  })
}
