const compile = require('./compile')
const escape = require('./vdom/utilities/escape')
const { readFile } = require('fs')
const { dirname } = require('path')
const { promisify } = require('util')
const { print } = require('./utilities/log')
const { optimize } = require('./optimizers/html')

const read = promisify(readFile)

function createRender ({
  compilerOptions = { paths: [] },
  globals = {},
  cacheEnabled = true,
  log = false
} = {}) {
  const cache = new Map()
  async function compileFile (path) {
    if (cacheEnabled && cache.has(path)) return cache.get(path)
    const source = await read(path, 'utf8')
    const { paths = [], ...options } = compilerOptions
    const { template, warnings, errors } = await compile(source, {
      ...options,
      paths: [dirname(path), ...paths]
    })
    if (cacheEnabled) { cache.set(path, template) }
    if (log) { print({ path, warnings, errors, log }) }
    return template
  }

  return async function render (path, options, callback) {
    try {
      const template = await compileFile(path)
      const params = typeof globals === 'function' ? globals(path, options) : globals
      const html = template({ ...params, ...options }, escape)
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
