const test = require('ava')
const path = require('path')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

test('globals: Math', async assert => {
  var { template } = await compile('{Math.abs(foo)}')
  assert.deepEqual(template({ foo: -1 }, escape), '1')

  var { template } = await compile('{Math.ceil(foo)}')
  assert.deepEqual(template({ foo: 1.6 }, escape), '2')

  var { template } = await compile('{Math.floor(foo)}')
  assert.deepEqual(template({ foo: 1.6 }, escape), '1')

  var { template } = await compile('{Math.round(foo)}')
  assert.deepEqual(template({ foo: 1.4 }, escape), '1')

  var { template } = await compile('{Math.round(foo)}')
  assert.deepEqual(template({ foo: 1.6 }, escape), '2')

  var { template } = await compile('{Math.pow(foo, 3)}')
  assert.deepEqual(template({ foo: 2 }, escape), '8')
})

test('globals: Number', async assert => {
  var { template } = await compile('{Number.isFinite(foo)}')
  assert.deepEqual(template({ foo: 42 }, escape), 'true')

  var { template } = await compile('{Number.isFinite(foo)}')
  assert.deepEqual(template({ foo: Infinity }, escape), 'false')
})

test('globals: Date', async assert => {
  var { template } = await compile('{Date.parse("01 Jan 1970 00:00:00 GMT")}')
  assert.deepEqual(template({ foo: { bar: 'baz' } }, escape), '0')

  var { template } = await compile('{Date.parse("04 Dec 1995 00:12:00 GMT")}')
  assert.deepEqual(template({}, escape), '818035920000')
})
