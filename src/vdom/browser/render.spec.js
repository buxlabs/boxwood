'use strict'

const test = require('ava')
const env = require('browser-env')
const render = require('./render')
const tag = require('../tag')

test.before(() => {
  env(['document'])
})

test('#render: creates a dom node from a vdom node', assert => {
  const node = render(tag('div', { class: 'foo', id: 'bar' }))
  assert.deepEqual(node.tagName, 'DIV')
  assert.deepEqual(node.classList.contains('foo'), true)
  assert.deepEqual(node.id, 'bar')
})

test('#render: renders text nodes', assert => {
  const node = render('foo')
  assert.deepEqual(node.textContent, 'foo')
})

test('#render: creates children nodes (text)', assert => {
  const node = render(tag('div', { class: 'foo' }, 'bar'))
  assert.deepEqual(node.tagName, 'DIV')
  assert.deepEqual(node.classList.contains('foo'), true)
  assert.deepEqual(node.innerHTML, 'bar')
})

test('#render: creates children nodes (tag)', assert => {
  const node = render(tag('div', { class: 'foo' }, tag('p', 'bar')))
  assert.deepEqual(node.tagName, 'DIV')
  assert.deepEqual(node.classList.contains('foo'), true)
  assert.deepEqual(node.innerHTML, '<p>bar</p>')
})

