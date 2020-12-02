'use strict'

const tag = require('./tag')
const mount = require('./mount')
const render = require('./render')
const diff = require('./diff')
const app = require('./app')

const div = (attributes, children) => tag('div', attributes, children)
const button = (attributes, children) => tag('button', attributes, children)

module.exports = {
  app,
  mount,
  render,
  diff,
  tag,
  div,
  button
}
