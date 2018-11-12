import test from 'ava'
import compile from '../../helpers/compile'

test('globals', async assert => {
  let template
  console.time('globals')

  template = await compile('{Math.abs(foo)}')
  assert.deepEqual(template({ foo: -1 }, html => html), '1')

  template = await compile('{Math.ceil(foo)}')
  assert.deepEqual(template({ foo: 1.6 }, html => html), '2')

  template = await compile('{Math.floor(foo)}')
  assert.deepEqual(template({ foo: 1.6 }, html => html), '1')

  template = await compile('{Math.round(foo)}')
  assert.deepEqual(template({ foo: 1.4 }, html => html), '1')

  template = await compile('{Math.round(foo)}')
  assert.deepEqual(template({ foo: 1.6 }, html => html), '2')

  template = await compile('{Math.pow(foo, 3)}')
  assert.deepEqual(template({ foo: 2 }, html => html), '8')

  template = await compile('{Number.isFinite(foo)}')
  assert.deepEqual(template({ foo: 42 }, html => html), 'true')

  template = await compile('{Number.isFinite(foo)}')
  assert.deepEqual(template({ foo: Infinity }, html => html), 'false')

  template = await compile('{JSON.stringify(foo, null, 2)}')
  assert.deepEqual(template({ foo: { bar: 'baz' } }, html => html), '{\n  "bar": "baz"\n}')

  template = await compile('{JSON.stringify(foo, null, 4)}')
  assert.deepEqual(template({ foo: { bar: 'baz' } }, html => html), '{\n    "bar": "baz"\n}')

  template = await compile('{Date.parse("01 Jan 1970 00:00:00 GMT")}')
  assert.deepEqual(template({ foo: { bar: 'baz' } }, html => html), '0')

  template = await compile('{Date.parse("04 Dec 1995 00:12:00 GMT")}')
  assert.deepEqual(template({}, html => html), '818035920000')

  console.timeEnd('globals')
})
