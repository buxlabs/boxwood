const test = require('ava')
const compile = require('../../helpers/deprecated-compile')
const { escape } = require('../../..')

test('div[style]: curly syntax', async assert => {
  var { template } = await compile(`<div style="{{color: 'red'}}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="color:red;"></div>')
})

test('div[style]: short curly syntax', async assert => {
  var { template } = await compile(`<div style={{color:'red'}}></div>`)
  assert.deepEqual(template({}, escape), '<div style="color:red;"></div>')
})

test('div[style]: curly syntax with nested object', async assert => {
  var { template } = await compile(`<div style="{{ padding: { bottom: "15px" }}}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-bottom:15px;"></div>')
})

test('div[style]: curly syntax with camel cased keys', async assert => {
  var { template } = await compile(`<div style="{{ paddingBottom: "15px" }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-bottom:15px;"></div>')
})
