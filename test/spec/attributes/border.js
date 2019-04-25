import test from 'ava'
import compile from '../../helpers/compile'
import escape from 'escape-html'

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
