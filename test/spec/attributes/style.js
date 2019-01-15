import test from '../../helpers/test'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('div[style]: curly syntax', async assert => {
  const template = await compile(`<div style="{{color: 'red'}}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="color:red;"></div>')
})

test('div[style]: short curly syntax', async assert => {
  const template = await compile(`<div style={{color:'red'}}></div>`)
  assert.deepEqual(template({}, escape), '<div style="color:red;"></div>')
})

test('div[style]: curly syntax with nested object', async assert => {
  const template = await compile(`<div style="{{ padding: { bottom: "15px" }}}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-bottom:15px;"></div>')
})

test('div[style]: curly syntax with camel cased keys', async assert => {
  const template = await compile(`<div style="{{ paddingBottom: "15px" }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-bottom:15px;"></div>')
})
