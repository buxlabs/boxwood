'use strict'

const test = require('ava')
const tag = require('./tag')

test('#tag: is a plain object that is used to represent a dom node', assert => {
  const node = tag('span')
  assert.deepEqual(node, { name: 'span', attributes: {}, children: [] })
})

test('#tag: has attributes', assert => {
  const node = tag('div', { class: 'foo' })
  assert.deepEqual(node, { name: 'div', attributes: { class: 'foo' }, children: [] })
})

test('#tag: works if children is not an array', assert => {
  const node = tag('div', {}, 'foo')
  assert.deepEqual(node, { name: 'div', attributes: {}, children: ['foo'] })
})

test('#tag: works if attributes are not passed', assert => {
  const node = tag('div', 'foo')
  assert.deepEqual(node, { name: 'div', attributes: {}, children: ['foo'] })
})

test('#tag: works if children is an array', assert => {
  const node = tag('div', { class: 'foo' }, ['bar'])
  assert.deepEqual(node, { name: 'div', attributes: { class: 'foo' }, children: ['bar'] })
})

test('#tag: return a div when no params were passed', assert => {
  const node = tag()
  assert.deepEqual(node, { name: 'div', attributes: {}, children: [] })
})
