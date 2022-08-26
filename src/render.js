const compile = require('./compile')
const { promises: { readFile } } = require('fs')
const { dirname } = require('path')
const { print } = require('./utilities/log')
const { optimize } = require('./optimizers/html')

function createRender ({
  compilerOptions = { paths: [] },
  globals = {},
  cache = true,
  log = false
} = {}) {
  const map = new Map()
  async function compileFile (path) {
    if (cache && map.has(path)) return map.get(path)
    const source = await readFile(path, 'utf8')
    const { paths = [], ...options } = compilerOptions
    const { template, errors } = await compile(source, {
      ...options,
      paths: [dirname(path), ...paths]
    })
    if (cache) { map.set(path, template) }
    if (log) { print({ path, errors, log }) }
    return template
  }

  return async function render (path, options, callback) {
    try {
      const template = await compileFile(path)
      const params = typeof globals === 'function' ? globals(path, options) : globals
      const html = template({ ...params, ...options })
      // TODO consider caching optimized html too
      // optimization process can be slow
      const optimizedHtml = optimize(html)
      if (callback) return callback(null, optimizedHtml)
      return optimizedHtml
    } catch (exception) {
      if (callback) return callback(exception)
      return exception.message
    }
  }
}

module.exports = {
  createRender
}
