const { promises: { writeFile } } = require('fs')
const { tmpdir } = require('os')
const { join } = require('path')
const { randomBytes } = require('crypto')

async function compile (input) {
  const path = join(tmpdir(), `${randomBytes(32).toString('hex')}.js`)
  await writeFile(path, input)
  const template = require(path)
  return {
    template
  }
}

module.exports = {
  compile
}
