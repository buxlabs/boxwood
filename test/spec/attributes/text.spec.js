const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

test('[text]: inline text', async assert => {
  var { template } = await compile('<div text="foo"></div>')
  assert.deepEqual(template({}, escape), '<div>foo</div>')
})

test('[text]: inline expressions', async assert => {
  var { template } = await compile('<div text="{foo}"></div>')
  assert.deepEqual(template({ foo: 'bar' }, escape), '<div>bar</div>')
})

test.skip('[text]: inline call expressions', async assert => {
  var { template } = await compile('<div text="{foo(bar())}"></div>')
  assert.deepEqual(template({ foo: string => string, bar: () => 'bar' }, escape), '<div>bar</div>')
})
