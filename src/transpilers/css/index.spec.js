'use strict'

const test = require('ava')
const { transpile, getSelectors } = require('.')

test('transpile: class selector', assert => {
  assert.deepEqual(transpile('.foo { color: red }'), '.foo-2771010719{color:red}')
})

test('transpile: class selector with a hyphen', assert => {
  assert.deepEqual(transpile('.foo-bar { color: red }'), '.fooBar-1294733379{color:red}')
})

test('transpile: type selector', assert => {
  assert.deepEqual(transpile('h3 { color: red }'), '.h3-1911416268{color:red}')
})

test('getSelectors: class selector', assert => {
  assert.deepEqual(getSelectors('.foo-2771010719{color:red}'), { foo: 'foo-2771010719' })
})
test('getSelectors: class selector with a camelized name', assert => {
  assert.deepEqual(getSelectors('.fooBar-1294733379{color:red}'), { fooBar: 'fooBar-1294733379' })
})
