import test from '../../helpers/test'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('switch', async assert => {
  let template

  template = await compile('<switch foo><case is present>bar</case></switch>')
  assert.deepEqual(template({ foo: true }, escape), 'bar')

  template = await compile('<switch foo><case is present>bar</case></switch>')
  assert.deepEqual(template({ foo: undefined }, escape), '')

  template = await compile('<switch foo><case is undefined>bar</case></switch>')
  assert.deepEqual(template({}, escape), 'bar')

  template = await compile('<switch foo><case is undefined>bar</case></switch>')
  assert.deepEqual(template({ foo: 'hello' }, escape), '')

  template = await compile('<switch foo><case is present>bar</case><case is undefined>baz</case></switch>')
  assert.deepEqual(template({ foo: 'hello' }, escape), 'bar')

  template = await compile('<switch foo><case is present>bar</case><case is undefined>baz</case></switch>')
  assert.deepEqual(template({ foo: undefined }, escape), 'baz')

  template = await compile('<switch foo><case is positive>bar</case><case is negative>baz</case></switch>')
  assert.deepEqual(template({ foo: 100 }, escape), 'bar')

  template = await compile('<switch foo><case is positive>bar</case><case is negative>baz</case></switch>')
  assert.deepEqual(template({ foo: -100 }, escape), 'baz')

  template = await compile('<switch foo><case is positive>bar</case><case is negative>baz</case><default>qux</default></switch>')
  assert.deepEqual(template({ foo: 100 }, escape), 'bar')

  template = await compile('<switch foo><case is positive>bar</case><case is negative>baz</case><default>qux</default></switch>')
  assert.deepEqual(template({ foo: -100 }, escape), 'baz')

  template = await compile('<switch foo><case is positive>bar</case><case is negative>baz</case><default>qux</default></switch>')
  assert.deepEqual(template({ foo: 0 }, escape), 'qux')

  template = await compile('<switch foo><case is positive>bar</case><case is negative>baz</case><default>qux</default></switch>')
  assert.deepEqual(template({ foo: 0 }, escape), 'qux')
})
