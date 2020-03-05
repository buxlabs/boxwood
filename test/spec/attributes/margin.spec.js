const test = require('ava')
const compile = require('../../helpers/compile')
const escape = require('escape-html')

test('div[margin]: works with values', async assert => {
  const { template } = await compile(`<div margin="15px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin: 15px;"></div>')
})

test('div[margin]: works with expressions', async assert => {
  const { template } = await compile(`<div id="qux" class="foo bar ban" margin="{15}"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="margin: 15px;"></div>')
})

test('div[margin]: works with object', async assert => {
  const { template } = await compile(`<div margin="{{ top: 15 }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin-top: 15px;"></div>')
})

test('div[margin]: works with camelCasecase attributes', async assert => {
  var { template } = await compile(`<div marginTop="10"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin-top: 10px;"></div>')

  var { template } = await compile(`<div marginRight="10"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin-right: 10px;"></div>')

  var { template } = await compile(`<div marginBottom="10px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin-bottom: 10px;"></div>')

  var { template } = await compile(`<div marginLeft="10"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin-left: 10px;"></div>')

  var { template } = await compile(`<div marginLeft="10" marginRight="20px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin-right: 20px; margin-left: 10px;"></div>')

  var { template } = await compile(`<div marginLeft="10" marginRight="20px" marginBottom="30px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin-right: 20px; margin-bottom: 30px; margin-left: 10px;"></div>')

  var { template } = await compile(`<div margin-top="10" marginBottom="10"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin-top: 10px; margin-bottom: 10px;"></div>')
})

test('div[margin]: works with kebab-case attributes', async assert => {
  var { template } = await compile(`<div margin-top="10"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin-top: 10px;"></div>')

  var { template } = await compile(`<div margin-right="10"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin-right: 10px;"></div>')

  var { template } = await compile(`<div margin-bottom="10px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin-bottom: 10px;"></div>')

  var { template } = await compile(`<div margin-left="10"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin-left: 10px;"></div>')

  var { template } = await compile(`<div margin-left="10" margin-right="20px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin-right: 20px; margin-left: 10px;"></div>')

  var { template } = await compile(`<div margin-left="10" margin-right="20px" margin-bottom="30px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin-right: 20px; margin-bottom: 30px; margin-left: 10px;"></div>')
})

test('div[margin]: works with predefined style variables', async assert => {
  const { template } = await compile(`<div marginTop="small"></div>`, { style: { variables: { small: 10, big: '40px' } } })
  assert.deepEqual(template({}, escape), '<div style="margin-top: 10px;"></div>')
})

test('div[margin]: predefined variable in curly syntax', async assert => {
  const { template } = await compile(`<div margin="{{ top: 'small' }}"></div>`, { style: { variables: { small: 10, big: '40px' } } })
  assert.deepEqual(template({}, escape), '<div style="margin-top: 10px;"></div>')
})

test('div[margin]: predefined variable in curly syntax for multiple keys', async assert => {
  const { template } = await compile(`<div margin="{{ bottom: 'small', top: 'big' }}"></div>`, { style: { variables: { small: 10, big: '40px' } } })
  assert.deepEqual(template({}, escape), '<div style="margin-bottom: 10px; margin-top: 40px;"></div>')
})

test('div[margin]: predefined variable for multiple attributes', async assert => {
  const { template } = await compile(`<div margin-bottom='big' margin-top='small'></div>`, { style: { variables: { small: 10, big: '40px' } } })
  assert.deepEqual(template({}, escape), '<div style="margin-top: 10px; margin-bottom: 40px;"></div>')
})
