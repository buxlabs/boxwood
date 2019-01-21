import test from '../../helpers/test'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('div[padding]: simple passing a value', async assert => {
  const template = await compile(`<div padding="15px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding: 15px;"></div>')
})

test('div[padding]: working with another attributes', async assert => {
  const template = await compile(`<div id="qux" class="foo bar ban" padding="15px"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 15px;"></div>')
})

test('div[padding]: working with many attributes', async assert => {
  const template = await compile(`
    <div class="row" padding="0">
      <div id="qux" class="foo bar ban" padding="15px"></div>
    </div>`)
  assert.deepEqual(template({}, escape), '<div class="row" style="padding: 0;"><div id="qux" class="foo bar ban" style="padding: 15px;"></div></div>')
})

test('div[padding]: working without unit', async assert => {
  const template = await compile(`<div id="qux" class="foo bar ban" padding="15"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 15px;"></div>')
})

test('div[padding]: working with units', async assert => {
  const template = await compile(`<div id="qux" class="foo bar ban" padding="15%"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 15%;"></div>')
})

test('div[padding]: working with units2', async assert => {
  const template = await compile(`<div id="qux" class="foo bar ban" padding="3em"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 3em;"></div>')
})
