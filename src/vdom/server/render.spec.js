'use strict'

const test = require('ava')
const render = require('./render')
const tag = require('./tag')

test('#render: creates a dom node from a vdom node', assert => {
  const html = render(tag('div', { class: 'foo', id: 'bar' }))
  assert.deepEqual(html, '<div class="foo" id="bar"></div>')
})

test('#render: renders text nodes', assert => {
  const html = render('foo')
  assert.deepEqual(html, 'foo')
})

test('#render: creates children nodes', assert => {
  const html = render(tag('div', { class: 'foo' }, 'bar'))
  assert.deepEqual(html, '<div class="foo">bar</div>')
})
