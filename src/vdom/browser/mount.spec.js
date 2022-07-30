'use strict'

const test = require('ava')
const { JSDOM } = require('jsdom')
const mount = require('./mount')
const render = require('./render')
const tag = require('../tag')

test.before(() => {
  const { window } = new JSDOM('<!doctype html><html><head></head><body></body></html>')
  global.document = window.document
})

test.after(() => {
  delete global.document
})

test('#mount: mounts nodes', assert => {
  const node = document.createElement('div')
  node.id = 'app'
  document.body.appendChild(node)
  const app = tag('div', { class: 'foo' }, 'bar')
  mount(
    render(app),
    document.querySelector('#app')
  )
  assert.deepEqual(document.body.innerHTML, '<div class="foo">bar</div>')
})
