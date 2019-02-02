import test from '../../helpers/test'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('div[border]: works with values', async assert => {
  const template = await compile(`<div border="1px solid red"></div>`)
  assert.deepEqual(template({}, escape), '<div style="border: 1px solid red;"></div>')
})
