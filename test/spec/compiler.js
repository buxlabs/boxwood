import test from 'ava'
import compile from '../helpers/compile'

test('basic: it returns nothing for no template', async assert => {
  var { errors } = await compile('', { paths: 'foo' })
  assert.deepEqual(errors[0], 'Compiler option paths must be an array')
})
