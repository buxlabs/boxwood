const test = require('ava')
const compile = require('../../helpers/deprecated-compile')
const { escape } = require('../../..')

test('[html]', async assert => {
  var { template } = await compile('<div html="foo"></div>')
  assert.deepEqual(template(), '<div>foo</div>')

  var { template } = await compile('<div class="foo" html="{bar}"></div>')
  assert.deepEqual(template({ bar: 'baz' }), '<div class="foo">baz</div>')

  var { template } = await compile('<div html="{foo}"></div>')
  assert.deepEqual(template({ foo: 'bar' }), '<div>bar</div>')

  var { template } = await compile('<div html="foo"></div>')
  assert.deepEqual(template({}), '<div>foo</div>')

  var { template } = await compile('<div html="foo"></div>')
  assert.deepEqual(template({}), '<div>foo</div>')

  var { template } = await compile('<div html="{foo}">xxx</div>')
  assert.deepEqual(template({ foo: 'bar' }), '<div>barxxx</div>')

  var { template } = await compile('<div html="{foo}"></div>')
  assert.deepEqual(template({ foo: '<div>baz</div>' }), '<div><div>baz</div></div>')

  var { template } = await compile('<div html={foo}></div>')
  assert.deepEqual(template({ foo: 'bar' }), '<div>bar</div>')

  var { template } = await compile('<div html="{ foo }"></div>')
  assert.deepEqual(template({ foo: 'bar' }), '<div>bar</div>')

  var { template } = await compile('<div html="{foo(bar())}"></div>')
  assert.deepEqual(template({ foo: string => string, bar: () => 'bar' }, escape), '<div>bar</div>')
})
