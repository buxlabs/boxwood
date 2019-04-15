import test from '../../helpers/test'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('each', async assert => {
  var { template } = await compile(`<each foo in bar>{foo}</each>`)
  assert.deepEqual(template({
    bar: {
      each: function (callback) {
        const elements = [1, 2, 3]
        elements.forEach(callback)
      }
    }
  }, escape), '123')
})
