import test from '../../helpers/test'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('try', async assert => {
  let template

  template = await compile('<try>{foo.bar}</try><catch>baz</catch>')
  assert.deepEqual(template({ foo: { bar: 'bar' } }, escape), 'bar')

  template = await compile('<try>{foo.bar.baz}</try><catch>qux</catch>')
  assert.deepEqual(template(), 'qux')

  template = await compile('<try>{foo.bar.baz.bam}</try><catch>qux</catch>')
  assert.deepEqual(template({ foo: { bar: { baz: { bam: 'bam' } } } }, escape), 'bam')

  template = await compile('<try>{foo.bar.baz.bam}</try><catch>qux</catch>')
  assert.deepEqual(template({}), 'qux')

  template = await compile('<try>{foo.bar}</try><catch>baz</catch>')
  assert.deepEqual(template({ foo: { bar: 'bar' } }, escape), 'bar')

  template = await compile('<try><div>{foo.bar}</div></try><catch>baz</catch>')
  assert.deepEqual(template({}, escape), 'baz')
})


