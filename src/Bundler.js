const { rollup } = require('rollup')
const { writeFileSync, unlinkSync } = require('fs')
const { join } = require('path')
const { tmpdir } = require('os')

function makeid(length) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

class Bundler {
  async bundle (source, options = {}) {
    const output = await this.transform(source, options)
    return output
  }

  async transform (source, options) {
    const id = makeid(32)
    const filename = `${id}.js`
    const filepath = join(tmpdir(), filename)
    writeFileSync(filepath, source)
    const bundle = await rollup({
      input: filepath
    })
    const { output } = await bundle.generate({
      format: 'iife'
    })
    const { code } = output[0]
    unlinkSync(filepath)
    return code
  }
}

module.exports = Bundler
