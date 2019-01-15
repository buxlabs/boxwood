import test from '../../helpers/test'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('div[style]: curly syntax', async assert => {
  const template = await compile(`<div style="{{color: 'red'}}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="color:red;"></div>')
})
