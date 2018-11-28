const ava = require('ava')
const colors = require('ansi-colors')
const verbose = process.env.VERBOSE

function test (description, callback) {
  ava(description, async assert => {
    if (verbose) {
      console.time(colors.yellowBright(description))
    }
    await callback(assert)
    if (verbose) {
      console.timeEnd(colors.yellowBright(description))
    }
  })
}

test.skip = ava.skip
test.only = ava.only

module.exports = test
