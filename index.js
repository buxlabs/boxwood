const { promises: { writeFile, unlink } } = require('fs')
const { randomBytes } = require('crypto')

async function compile (input, { path } = {}) {
  const file = (path || __filename).replace(/\.js$/, `${randomBytes(32).toString('hex')}.js`)
  await writeFile(file, input)
  const template = require(file)
  await unlink(file)
  return {
    template
  }
}

const ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
}

const REGEXP = /[&<>'"]/g

const escape = (string) => {
  return String.prototype.replace.call(string, REGEXP, function (character) {
    return ENTITIES[character]
  })
}

module.exports = {
  compile,
  escape
}
