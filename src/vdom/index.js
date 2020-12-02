'use strict'

const tag = require('./tag')
const mount = require('./mount')
const render = require('./render')
const diff = require('./diff')
const app = require('./app')
const nodes = require('./nodes')

module.exports = {
  ...nodes,
  app,
  mount,
  render,
  diff,
  tag
}
