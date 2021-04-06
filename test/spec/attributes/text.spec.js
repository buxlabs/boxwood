const test = require('ava')
const compile = require('../../helpers/deprecated-compile')
const { escape } = require('../../..')

test('[text]', async assert => {
  var { template } = await compile('<div text="foo"></div>')
  assert.deepEqual(template({}, escape), '<div>foo</div>')

  var { template } = await compile('<div class="foo" text="{bar}"></div>')
  assert.deepEqual(template({ bar: 'baz' }, value => { return value }), '<div class="foo">baz</div>')

  var { template } = await compile('<div text="{foo}"></div>')
  assert.deepEqual(template({ foo: 'bar' }, escape), '<div>bar</div>')

  var { template } = await compile('<div text="{foo(bar())}"></div>')
  assert.deepEqual(template({ foo: string => string, bar: () => 'bar' }, escape), '<div>bar</div>')
})
