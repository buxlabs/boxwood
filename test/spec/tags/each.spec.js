const test = require('ava')
const compile = require('../../helpers/deprecated-compile')
const { escape } = require('../../..')

test('each', async assert => {
  const { template } = await compile(`<each foo in bar>{foo}</each>`)
  assert.deepEqual(template({
    bar: {
      each: function (callback) {
        const elements = [1, 2, 3]
        elements.forEach(callback)
      }
    }
  }, escape), '123')
})
