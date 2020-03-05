const test = require('ava')
const compile = require('../../helpers/compile')
const escape = require('escape-html')

test('div[padding]: works with values', async assert => {
  var { template } = await compile(`<div padding="15px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding: 15px;"></div>')

  var { template } = await compile(`<div id="qux" class="foo bar ban" padding="15px"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 15px;"></div>')

  var { template } = await compile(`<div class="row" padding="0"><div id="qux" class="foo bar ban" padding="15px"></div></div>`)
  assert.deepEqual(template({}, escape), '<div class="row" style="padding: 0;"><div id="qux" class="foo bar ban" style="padding: 15px;"></div></div>')

  var { template } = await compile(`<div id="qux" class="foo bar ban" padding="15"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 15px;"></div>')

  var { template } = await compile(`<div id="qux" class="foo bar ban" padding="15%"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 15%;"></div>')

  var { template } = await compile(`<div id="qux" class="foo bar ban" padding="3em"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 3em;"></div>')

  var { template } = await compile(`<div padding="15px" style="margin: 0 auto;"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin: 0 auto; padding: 15px;"></div>')

  var { template } = await compile(`<div class="foo bar" padding="15px" style="margin: 0 auto;"></div>`)
  assert.deepEqual(template({}, escape), '<div class="foo bar" style="margin: 0 auto; padding: 15px;"></div>')

  var { template } = await compile(`<div padding="15px" style="margin: 0 auto; background: #f0f;"><h1>Hello World!</h1></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin: 0 auto; background: #f0f; padding: 15px;"><h1>Hello World!</h1></div>')

  var { template } = await compile(`<div padding="15px 10px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding: 15px 10px;"></div>')

  var { template } = await compile(`<div padding="15px 10px 20px 30px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding: 15px 10px 20px 30px;"></div>')

  var { template } = await compile(`<div padding=" 15px  10px  20px  30px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding:  15px  10px  20px  30px;"></div>')

  var { template } = await compile(`<div style="margin: 0 auto;" padding=" 15px  10px  20px  30px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin: 0 auto; padding:  15px  10px  20px  30px;"></div>')
})

test('div[padding]: works with expressions', async assert => {
  var { template } = await compile(`<div id="qux" class="foo bar ban" padding="{15}"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 15px;"></div>')

  var { template } = await compile(`<div id="qux" class="foo bar ban" padding="{ 15 }"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 15px;"></div>')

  var { template } = await compile(`<div id="qux" class="foo bar ban" padding="{0}"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 0;"></div>')

  var { template } = await compile(`<div id="qux" class="foo bar ban" padding="{'15px'}"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 15px;"></div>')

  var { template } = await compile(`<div id="qux" class="foo bar ban" padding="{'  15px  '}"></div>`)
  assert.deepEqual(template({}, escape), '<div id="qux" class="foo bar ban" style="padding: 15px;"></div>')

  var { errors } = await compile(`<div id="qux" class="foo bar ban" padding="{15px}"></div>`)
  assert.deepEqual(errors[0].message, '[1:3]: No identifiers allowed directly after numeric literal')

  var { template } = await compile(`<div id="qux" class="foo bar ban" padding={15}></div>`)
  assert.deepEqual(template({}, escape), `<div id="qux" class="foo bar ban" style="padding: 15px;"></div>`)

  var { template } = await compile(`<div padding="{20}" style="margin: 0 auto;"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin: 0 auto; padding: 20px;"></div>')

  var { template } = await compile(`<div padding="{0}" style="margin: 0 auto;"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin: 0 auto; padding: 0;"></div>')

  var { template } = await compile(`<div padding="{ '15px' }" style="margin: 0 auto;"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin: 0 auto; padding: 15px;"></div>')
})

test('div[padding]: works with object', async assert => {
  var { template } = await compile(`<div padding="{{ top: 15 }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-top: 15px;"></div>')

  var { template } = await compile(`<div padding="{{ top: 15, left: 30 }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-top: 15px; padding-left: 30px;"></div>')

  var { template } = await compile(`<div padding="{{ top: 15, left: 30, right: 0 }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-top: 15px; padding-left: 30px; padding-right: 0;"></div>')

  var { template } = await compile(`<div padding="{{ top: 15, left: 30, right: 0, bottom: 100 }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-top: 15px; padding-left: 30px; padding-right: 0; padding-bottom: 100px;"></div>')

  var { template } = await compile(`<div padding="{{ top: '15px' }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-top: 15px;"></div>')

  var { template } = await compile(`<div padding="{{ top: '15px', left: '30px' }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-top: 15px; padding-left: 30px;"></div>')

  var { template } = await compile(`<div padding="{{ top: '15px', left: '30px', right: 0 }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-top: 15px; padding-left: 30px; padding-right: 0;"></div>')

  var { template } = await compile(`<div padding="{{ top: '15px', left: '30px', right: 0, bottom: '100px' }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-top: 15px; padding-left: 30px; padding-right: 0; padding-bottom: 100px;"></div>')

  var { template } = await compile(`<div style="margin: 0;" padding="{{ top: 30 }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin: 0; padding-top: 30px;"></div>')

  var { template } = await compile(`<div style="margin: 0;" padding="{{ top: 30, right: 25 }}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="margin: 0; padding-top: 30px; padding-right: 25px;"></div>')

  var { template } = await compile(`<div style="display: flex; justify-content: center;" padding="{{top: '3em', bottom: '3em', right: 10, left: '5%'}}"></div>`)
  assert.deepEqual(template({}, escape), '<div style="display: flex; justify-content: center; padding-top: 3em; padding-bottom: 3em; padding-right: 10px; padding-left: 5%;"></div>')
})

test('div[padding]: works with kebab-case attributes', async assert => {
  var { template } = await compile(`<div padding-top="10"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-top: 10px;"></div>')

  var { template } = await compile(`<div padding-right="10px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-right: 10px;"></div>')

  var { template } = await compile(`<div padding-bottom="10px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-bottom: 10px;"></div>')

  var { template } = await compile(`<div padding-left="10px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-left: 10px;"></div>')

  var { template } = await compile(`<div padding-left="10" padding-right="20px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-right: 20px; padding-left: 10px;"></div>')

  var { template } = await compile(`<div padding-left="10" padding-right="20px" padding-bottom="30px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-right: 20px; padding-bottom: 30px; padding-left: 10px;"></div>')
})

test('div[padding]: works with camelCase attributes', async assert => {
  var { template } = await compile(`<div paddingTop="10"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-top: 10px;"></div>')

  var { template } = await compile(`<div paddingRight="10"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-right: 10px;"></div>')

  var { template } = await compile(`<div paddingBottom="10px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-bottom: 10px;"></div>')

  var { template } = await compile(`<div paddingLeft="10"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-left: 10px;"></div>')

  var { template } = await compile(`<div paddingLeft="10" paddingRight="20px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-right: 20px; padding-left: 10px;"></div>')

  var { template } = await compile(`<div paddingLeft="10" paddingRight="20px" paddingBottom="30px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-right: 20px; padding-bottom: 30px; padding-left: 10px;"></div>')

  var { template } = await compile(`<div padding-top="10" paddingBottom="10"></div>`)
  assert.deepEqual(template({}, escape), '<div style="padding-top: 10px; padding-bottom: 10px;"></div>')
})

test('div[padding]: works with predefined style variables', async assert => {
  const style = {
    variables: { small: 10, big: '40px' }
  }
  var { template } = await compile(`<div paddingTop="small"></div>`, { style })
  assert.deepEqual(template({}, escape), '<div style="padding-top: 10px;"></div>')

  var { template } = await compile(`<div padding="{{ top: 'small' }}"></div>`, { style })
  assert.deepEqual(template({}, escape), '<div style="padding-top: 10px;"></div>')

  var { template } = await compile(`<div padding="{{ bottom: 'small', top: 'big' }}"></div>`, { style })
  assert.deepEqual(template({}, escape), '<div style="padding-bottom: 10px; padding-top: 40px;"></div>')

  var { template } = await compile(`<div padding-bottom='big' padding-top='small'></div>`, { style })
  assert.deepEqual(template({}, escape), '<div style="padding-top: 10px; padding-bottom: 40px;"></div>')
})
