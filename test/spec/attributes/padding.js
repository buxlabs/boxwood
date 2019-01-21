import test from '../../helpers/test'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('div[padding]: works with values', async assert => {
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

  template = await compile(`<div padding="15px" style="margin: 0 auto;"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin: 0 auto; padding: 15px;"></div>')

  template = await compile(`<div class="foo bar" padding="15px" style="margin: 0 auto;"></div>`)
  assert.deepEqual(template({}, escape), '<div class="foo bar" style="margin: 0 auto; padding: 15px;"></div>')

  template = await compile(`<div padding="15px" style="margin: 0 auto; background: #f0f;"><h1>Hello World!</h1></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin: 0 auto; background: #f0f; padding: 15px;"><h1>Hello World!</h1></div>')
})

test('div[padding]: works with expressions', async assert => {
  let template = await compile(`<div id="qux" class="foo bar ban" padding="{15}"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 15px;"></div>')

  template = await compile(`<div id="qux" class="foo bar ban" padding="{ 15 }"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 15px;"></div>')

  template = await compile(`<div id="qux" class="foo bar ban" padding="{0}"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 0;"></div>')

  template = await compile(`<div id="qux" class="foo bar ban" padding="{'15px'}"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 15px;"></div>')

  template = await compile(`<div id="qux" class="foo bar ban" padding="{'  15px  '}"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 15px;"></div>')

  await assert.throwsAsync(compile(`<div id="qux" class="foo bar ban" padding="{15px}"></div>`))

  template = await compile(`<div padding="{20}" style="margin: 0 auto;"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin: 0 auto; padding: 20px;"></div>')

  template = await compile(`<div padding="{0}" style="margin: 0 auto;"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin: 0 auto; padding: 0;"></div>')

  template = await compile(`<div padding="{ '15px' }" style="margin: 0 auto;"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin: 0 auto; padding: 15px;"></div>')
})

test('div[padding]: works with object', async assert => {
  let template = await compile(`<div padding="{{ top: 15 }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-top: 15px;"></div>')

  template = await compile(`<div padding="{{ top: 15, left: 30 }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-top: 15px; padding-left: 30px;"></div>')

  template = await compile(`<div padding="{{ top: 15, left: 30, right: 0 }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-top: 15px; padding-left: 30px; padding-right: 0;"></div>')

  template = await compile(`<div padding="{{ top: 15, left: 30, right: 0, bottom: 100 }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-top: 15px; padding-left: 30px; padding-right: 0; padding-bottom: 100px;"></div>')

  template = await compile(`<div padding="{{ top: '15px' }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-top: 15px;"></div>')

  template = await compile(`<div padding="{{ top: '15px', left: '30px' }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-top: 15px; padding-left: 30px;"></div>')

  template = await compile(`<div padding="{{ top: '15px', left: '30px', right: 0 }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-top: 15px; padding-left: 30px; padding-right: 0;"></div>')

  template = await compile(`<div padding="{{ top: '15px', left: '30px', right: 0, bottom: '100px' }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-top: 15px; padding-left: 30px; padding-right: 0; padding-bottom: 100px;"></div>')
})
