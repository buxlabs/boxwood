'use strict'

const test = require('ava')
const render = require('./render')
const tag = require('../tag')
const { doctype } = require('../nodes')

test('#render: creates a dom node from a vdom node', assert => {
  const html = render(tag('div', { class: 'foo', id: 'bar' }))
  assert.deepEqual(html, '<div class="foo" id="bar"></div>')
})

test('#render: renders text nodes', assert => {
  const html = render('foo')
  assert.deepEqual(html, 'foo')
})

test('#render: creates children nodes (text)', assert => {
  const html = render(tag('div', { class: 'foo' }, 'bar'))
  assert.deepEqual(html, '<div class="foo">bar</div>')
})

test('#render: creates children nodes (tag)', assert => {
  const html = render(tag('div', { class: 'foo' }, tag('p', 'bar')))
  assert.deepEqual(html, '<div class="foo"><p>bar</p></div>')
})

test('#render: self closing tags', assert => {
  const html = render(tag('br'))
  assert.deepEqual(html, '<br>')
})

test('#render: self closing tags with attributes', assert => {
  const html = render(tag('hr', { class: 'primary' }))
  assert.deepEqual(html, '<hr class="primary">')
})

test('#render: doctype', assert => {
  const html = render(doctype())
  assert.deepEqual(html, '<!doctype html>')
})
