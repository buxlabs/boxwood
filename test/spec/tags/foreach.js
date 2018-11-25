import test from '../../helpers/test'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('foreach', async assert => {
  let template

  template = await compile(`<foreach foo in bar>{foo}</foreach>`)
  assert.deepEqual(template({ bar: [1, 2, 3] }, escape), '123')

  template = await compile(`<foreach foo and baz in bar>{foo}{baz}</foreach>`)
  assert.deepEqual(template({ bar: new Map([ ['qux', 1], ['quux', 2] ]) }, escape), '1qux2quux')

  template = await compile(`<foreach foo in bar>{foo}</foreach>`)
  assert.deepEqual(template({ bar: new Set([1, 2, 3, 4, 5]) }, escape), '12345')
})
