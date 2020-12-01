'use strict'

const tag = require('./tag')
const mount = require('./mount')
const render = require('./render')
const diff = require('./diff')

const div = (attributes, children) => tag('div', attributes, children)
const button = (attributes, children) => tag('button', attributes, children)

module.exports = {
  mount,
  render,
  diff,
  tag,
  div,
  button
}
