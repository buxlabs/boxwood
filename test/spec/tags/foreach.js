import test from 'ava'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('foreach', async assert => {
  var { template } = await compile(`<foreach foo in bar>{foo}</foreach>`)
  assert.deepEqual(template({ bar: [1, 2, 3] }, escape), '123')

  var { template } = await compile(`<foreach foo and baz in bar>{foo}{baz}</foreach>`)
  assert.deepEqual(template({ bar: new Map([ ['qux', 1], ['quux', 2] ]) }, escape), '1qux2quux')

  var { template } = await compile(`<foreach foo in bar>{foo}</foreach>`)
  assert.deepEqual(template({ bar: new Set([1, 2, 3, 4, 5]) }, escape), '12345')
})

test('foreach: inlining', async assert => {
  const { template } = await compile(`
    <template foo>
      <foreach car in cars>{car}</foreach>
    </template>
    <foo cars="{['BMW', 'Hyundai']}" />
  `)
  assert.deepEqual(template({}, escape), 'BMWHyundai')
})
