import test from '../../helpers/test'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test.skip('div[css]: html syntax', async assert => {
  var { template } = await compile(`<div css="color:red;"></div>`)
  assert.deepEqual(template({}, escape), '<div style="color:red;"></div>')
})

test.skip('div[css]: curly syntax', async assert => {
  var { template } = await compile(`<div css="{{color: 'red'}}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="color:red;"></div>')
})

test.skip('div[css]: short curly syntax', async assert => {
  var { template } = await compile(`<div css={{color:'red'}}></div>`)
  assert.deepEqual(template({}, escape), '<div style="color:red;"></div>')
})

test.skip('div[css]: curly syntax with nested object', async assert => {
  var { template } = await compile(`<div css="{{ padding: { bottom: "15px" }}}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-bottom:15px;"></div>')
})

test.skip('div[css]: curly syntax with camel cased keys', async assert => {
  var { template } = await compile(`<div css="{{ paddingBottom: "15px" }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-bottom:15px;"></div>')
})
