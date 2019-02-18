const ava = require('ava')
const verbose = process.env.VERBOSE

function test (description, callback) {
  ava(description, async assert => {
    if (verbose) {
      console.time(description)
    }
    await callback(assert)
    if (verbose) {
      console.timeEnd(description)
    }
  })
}

test.skip = ava.skip
test.only = ava.only

module.exports = test
