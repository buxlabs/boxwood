import test from '../../helpers/test'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('div[padding]: working with values', async assert => {
  let template = await compile(`<div padding="15px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding: 15px;"></div>')

  template = await compile(`<div id="qux" class="foo bar ban" padding="15px"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 15px;"></div>')

  template = await compile(`<div class="row" padding="0"><div id="qux" class="foo bar ban" padding="15px"></div></div>`)
  assert.deepEqual(template({}, escape), '<div class="row" style="padding: 0;"><div id="qux" class="foo bar ban" style="padding: 15px;"></div></div>')

  template = await compile(`<div id="qux" class="foo bar ban" padding="15"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 15px;"></div>')

  template = await compile(`<div id="qux" class="foo bar ban" padding="15%"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 15%;"></div>')

  template = await compile(`<div id="qux" class="foo bar ban" padding="3em"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 3em;"></div>')
})

test('div[padding]: working with expressions', async assert => {
  let template = await compile(`<div id="qux" class="foo bar ban" padding="{15}"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 15px;"></div>')

  template = await compile(`<div id="qux" class="foo bar ban" padding="{0}"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 0;"></div>')

  template = await compile(`<div id="qux" class="foo bar ban" padding="{'15px'}"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 15px;"></div>')

  template = await compile(`<div id="qux" class="foo bar ban" padding="{'  15px  '}"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 15px;"></div>')

  await assert.throwsAsync(compile(`<div id="qux" class="foo bar ban" padding="{15px}"></div>`))
})
