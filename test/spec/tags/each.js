import test from '../../helpers/test'
import compile from '../../helpers/compile'

test('each', async assert => {
  const template = await compile(`<each foo in bar>{foo}</each>`)
  assert.deepEqual(template({
    bar: {
      each: function (callback) {
        const elements = [1, 2, 3]
        elements.forEach(callback)
      }
    }
  }, html => html), '123')
})
