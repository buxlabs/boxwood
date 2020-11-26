'use strict'

const test = require('ava')
const tag = require('./tag')

test('#tag: is a plain object that is used to represent a dom node', assert => {
  const node = tag('div')
  assert.deepEqual(node, { name: 'div', attributes: {}, children: [] })
})

test('#tag: has attributes', assert => {
  const node = tag('div', { class: 'foo' })
  assert.deepEqual(node, { name: 'div', attributes: { class: 'foo' }, children: [] })
})
