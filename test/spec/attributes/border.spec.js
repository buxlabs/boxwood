const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')
const path = require('path')

test('div[border]: border attribute', async assert => {
  const { template } = await compile(`<div border="1px solid red"></div>`)
  assert.deepEqual(template({}, escape), '<div style="border: 1px solid red;"></div>')
})

test('div[border]: border-left attribute', async assert => {
  const { template } = await compile(`<div border-left="1px solid red"></div>`)
  assert.deepEqual(template({}, escape), '<div style="border-left: 1px solid red;"></div>')
})

test('div[border]: borderLeft attribute', async assert => {
  const { template } = await compile(`<div borderLeft="1px solid red"></div>`)
  assert.deepEqual(template({}, escape), '<div style="border-left: 1px solid red;"></div>')
})

test('div[border]: borderBottom attribute', async assert => {
  const { template } = await compile(`<div border-top="2px" border-bottom="2px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="border-top: 2px; border-bottom: 2px;"></div>')
})

test('div[border]: predefined border value', async assert => {
  const { template } = await compile(`<div border="small"></div>`, {
    style: {
      variables: {
        small: '1px solid black'
      }
    }
  })
  assert.deepEqual(template({}, escape), '<div style="border: 1px solid black;"></div>')
})

test.skip('partial[border]: does not convert the attribute', async assert => {
  const { template } = await compile('<partial from="./baz.html" border="top" />', {
    paths: [
      path.join(__dirname, '../../fixtures/partial/attributes')
    ]
  })
  assert.deepEqual(template({}, escape), '<div class="border-top"></div>')
})
