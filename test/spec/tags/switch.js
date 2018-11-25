import test from '../../helpers/test'
import compile from '../../helpers/compile'

test('switch', async assert => {
  let template

  template = await compile('<switch foo><case is present>bar</case></switch>')
  assert.deepEqual(template({ foo: true }, html => html), 'bar')

  template = await compile('<switch foo><case is present>bar</case></switch>')
  assert.deepEqual(template({ foo: undefined }, html => html), '')

  template = await compile('<switch foo><case is undefined>bar</case></switch>')
  assert.deepEqual(template({}, html => html), 'bar')

  template = await compile('<switch foo><case is undefined>bar</case></switch>')
  assert.deepEqual(template({ foo: 'hello' }, html => html), '')

  template = await compile('<switch foo><case is present>bar</case><case is undefined>baz</case></switch>')
  assert.deepEqual(template({ foo: 'hello' }, html => html), 'bar')

  template = await compile('<switch foo><case is present>bar</case><case is undefined>baz</case></switch>')
  assert.deepEqual(template({ foo: undefined }, html => html), 'baz')

  template = await compile('<switch foo><case is positive>bar</case><case is negative>baz</case></switch>')
  assert.deepEqual(template({ foo: 100 }, html => html), 'bar')

  template = await compile('<switch foo><case is positive>bar</case><case is negative>baz</case></switch>')
  assert.deepEqual(template({ foo: -100 }, html => html), 'baz')

  template = await compile('<switch foo><case is positive>bar</case><case is negative>baz</case><default>qux</default></switch>')
  assert.deepEqual(template({ foo: 100 }, html => html), 'bar')

  template = await compile('<switch foo><case is positive>bar</case><case is negative>baz</case><default>qux</default></switch>')
  assert.deepEqual(template({ foo: -100 }, html => html), 'baz')

  template = await compile('<switch foo><case is positive>bar</case><case is negative>baz</case><default>qux</default></switch>')
  assert.deepEqual(template({ foo: 0 }, html => html), 'qux')

  template = await compile('<switch foo><case is positive>bar</case><case is negative>baz</case><default>qux</default></switch>')
  assert.deepEqual(template({ foo: 0 }, html => html), 'qux')
})
