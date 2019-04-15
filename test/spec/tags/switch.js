import test from '../../helpers/test'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('switch', async assert => {
  var { template } = await compile('<switch foo><case is present>bar</case></switch>')
  assert.deepEqual(template({ foo: true }, escape), 'bar')

  var { template } = await compile('<switch foo><case is present>bar</case></switch>')
  assert.deepEqual(template({ foo: undefined }, escape), '')

  var { template } = await compile('<switch foo><case is undefined>bar</case></switch>')
  assert.deepEqual(template({}, escape), 'bar')

  var { template } = await compile('<switch foo><case is undefined>bar</case></switch>')
  assert.deepEqual(template({ foo: 'hello' }, escape), '')

  var { template } = await compile('<switch foo><case is present>bar</case><case is undefined>baz</case></switch>')
  assert.deepEqual(template({ foo: 'hello' }, escape), 'bar')

  var { template } = await compile('<switch foo><case is present>bar</case><case is undefined>baz</case></switch>')
  assert.deepEqual(template({ foo: undefined }, escape), 'baz')

  var { template } = await compile('<switch foo><case is positive>bar</case><case is negative>baz</case></switch>')
  assert.deepEqual(template({ foo: 100 }, escape), 'bar')

  var { template } = await compile('<switch foo><case is positive>bar</case><case is negative>baz</case></switch>')
  assert.deepEqual(template({ foo: -100 }, escape), 'baz')

  var { template } = await compile('<switch foo><case is positive>bar</case><case is negative>baz</case><default>qux</default></switch>')
  assert.deepEqual(template({ foo: 100 }, escape), 'bar')

  var { template } = await compile('<switch foo><case is positive>bar</case><case is negative>baz</case><default>qux</default></switch>')
  assert.deepEqual(template({ foo: -100 }, escape), 'baz')

  var { template } = await compile('<switch foo><case is positive>bar</case><case is negative>baz</case><default>qux</default></switch>')
  assert.deepEqual(template({ foo: 0 }, escape), 'qux')

  var { template } = await compile('<switch foo><case is positive>bar</case><case is negative>baz</case><default>qux</default></switch>')
  assert.deepEqual(template({ foo: 0 }, escape), 'qux')
})
