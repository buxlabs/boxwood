import test from '../../helpers/test'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('div[margin]: works with values', async assert => {
  const template = await compile(`<div margin="15px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin: 15px;"></div>')
})

test('div[margin]: works with expressions', async assert => {
  const template = await compile(`<div id="qux" class="foo bar ban" margin="{15}"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="margin: 15px;"></div>')
})

test('div[margin]: works with object', async assert => {
  const template = await compile(`<div margin="{{ top: 15 }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin-top: 15px;"></div>')
})
