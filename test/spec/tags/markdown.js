import test from 'ava'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('markdown', async assert => {
  var { template } = await compile('<markdown># foo</markdown>')
  assert.deepEqual(template({}, escape), '<h1 id="foo">foo</h1>')
})
