import test from 'ava'
import compile from '../helpers/compile'

test('ternary', async assert => {
  let template
  console.time('ternary')

  template = await compile('{foo ? "bar" : "baz"}')
  assert.deepEqual(template({ foo: true }, html => html), 'bar')

  template = await compile('{foo ? "bar" : "baz"}')
  assert.deepEqual(template({ foo: false }, html => html), 'baz')

  template = await compile('{foo ? bar : baz}')
  assert.deepEqual(template({ foo: true, bar: 'bar', baz: 'baz' }, html => html), 'bar')

  template = await compile('{foo ? bar : baz}')
  assert.deepEqual(template({ foo: false, bar: 'bar', baz: 'baz' }, html => html), 'baz')

  template = await compile('{foo.bar ? bar : baz}')
  assert.deepEqual(template({ foo: { bar: true }, bar: 'bar', baz: 'baz' }, html => html), 'bar')

  template = await compile('{foo.bar ? bar : baz}')
  assert.deepEqual(template({ foo: { bar: false }, bar: 'bar', baz: 'baz' }, html => html), 'baz')

  template = await compile('{foo.bar ? bar.baz : baz.qux}')
  assert.deepEqual(template({ foo: { bar: true }, bar: { baz: 'bar' }, baz: { qux: 'baz' } }, html => html), 'bar')

  template = await compile('{foo.bar ? bar.baz : baz.qux}')
  assert.deepEqual(template({ foo: { bar: false }, bar: { baz: 'bar' }, baz: { qux: 'baz' } }, html => html), 'baz')

  template = await compile('{foo || "bar"}')
  assert.deepEqual(template({ foo: 'foo' }, html => html), 'foo')

  template = await compile('{foo || "bar"}')
  assert.deepEqual(template({ foo: '' }, html => html), 'bar')

  // TODO {foo[bar] ? ...}
  console.timeEnd('ternary')
})
