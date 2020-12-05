'use strict'

const test = require('ava')
const env = require('browser-env')
const render = require('./render')
const tag = require('../tag')
const { doctype, html, head, body, header, main, footer } = require('../nodes')

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

test('#render: self closing tags', assert => {
  const node = render(tag('br'))
  assert.deepEqual(node.tagName, 'BR')
})

test('#render: self closing tags with attributes', assert => {
  const node = render(tag('hr', { class: 'primary' }))
  assert.deepEqual(node.tagName, 'HR')
})

test('#render: doctype', assert => {
  const node = render(doctype())
  assert.truthy(node)
})

test('#render: html page', assert => {
  const node = render([
    doctype(),
    html([
      head(),
      body([
        header('foo'),
        main('bar'),
        footer('baz')
      ])
    ])
  ])
  assert.truthy(node)
})

