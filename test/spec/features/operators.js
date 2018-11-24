import test from '../../helpers/test'
import compile from '../../helpers/compile'

test('operators: logical and', async assert => {
  let template

  template = await compile('<div>{foo && bar}</div>')
  assert.deepEqual(template({ foo: true, bar: true }, html => html), '<div>true</div>')

  template = await compile('<div>{foo && bar}</div>')
  assert.deepEqual(template({ foo: true, bar: false }, html => html), '<div>false</div>')

  template = await compile('<div>{foo && bar}</div>')
  assert.deepEqual(template({ foo: false, bar: true }, html => html), '<div>false</div>')

  template = await compile('<div>{foo && bar}</div>')
  assert.deepEqual(template({ foo: false, bar: false }, html => html), '<div>false</div>')
})

test('operators: logical or', async assert => {
  let template

  template = await compile('<div>{foo || bar}</div>')
  assert.deepEqual(template({ foo: true, bar: true }, html => html), '<div>true</div>')

  template = await compile('<div>{foo || bar}</div>')
  assert.deepEqual(template({ foo: true, bar: false }, html => html), '<div>true</div>')

  template = await compile('<div>{foo || bar}</div>')
  assert.deepEqual(template({ foo: false, bar: true }, html => html), '<div>true</div>')

  template = await compile('<div>{foo || bar}</div>')
  assert.deepEqual(template({ foo: false, bar: false }, html => html), '<div>false</div>')
})

test('operators: comparison', async assert => {
  let template

  template = await compile('<div>{foo > bar}</div>')
  assert.deepEqual(template({ foo: 1, bar: 0 }, html => html), '<div>true</div>')

  template = await compile('<div>{foo < bar}</div>')
  assert.deepEqual(template({ foo: 1, bar: 0 }, html => html), '<div>false</div>')

  template = await compile('<div>{foo >= bar}</div>')
  assert.deepEqual(template({ foo: 1, bar: 0 }, html => html), '<div>true</div>')

  template = await compile('<div>{foo <= bar}</div>')
  assert.deepEqual(template({ foo: 1, bar: 0 }, html => html), '<div>false</div>')

  template = await compile('{foo.length > 0 ? "active" : "inactive"}')
  assert.deepEqual(template({ foo: ['bar'] }, html => html), 'active')
  assert.deepEqual(template({ foo: [] }, html => html), 'inactive')

  // TODO handle more complex expressions
  // template = await compile('<div>{foo > bar && baz > qux}</div>')
  // assert.deepEqual(template({ foo: 1, bar: 0, baz: 1, qux: 0 }, html => html), '<div>true</div>')
})

test('operators: ternary', async assert => {
  let template

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

  template = await compile('{ foo ? foo + "bar" : "" }')
  assert.deepEqual(template({ foo: 'foo' }, html => html), 'foobar')

  template = await compile('{ foo ? foo + "bar" : "" }')
  assert.deepEqual(template({ foo: '' }, html => html), '')

  template = await compile('{ foo ? foo + "bar" : "" }')
  assert.deepEqual(template({ foo: undefined }, html => html), '')

  // TODO {foo[bar] ? ...}
})
