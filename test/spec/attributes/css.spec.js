const test = require('ava')
const compile = require('../../helpers/deprecated-compile')
const { escape } = require('../../..')

test('div[css]: html syntax', async assert => {
  const { template } = await compile(`<div css="color:red;"></div>`)
  assert.deepEqual(template({}, escape), '<div style="color:red;"></div>')
})

test('div[css]: curly syntax', async assert => {
  const { template } = await compile(`<div css="{{color: 'red'}}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="color:red;"></div>')
})

test('div[css]: short curly syntax', async assert => {
  const { template } = await compile(`<div css={{color:'red'}}></div>`)
  assert.deepEqual(template({}, escape), '<div style="color:red;"></div>')
})

test('div[css]: curly syntax with nested object', async assert => {
  const { template } = await compile(`<div css="{{ padding: { bottom: "15px" }}}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-bottom:15px;"></div>')
})

test('div[css]: curly syntax with camel cased keys', async assert => {
  const { template } = await compile(`<div css="{{ paddingBottom: "15px" }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-bottom:15px;"></div>')
})
