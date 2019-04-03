import test from '../../helpers/test'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('div[border]: works with values', async assert => {
  let template = await compile(`<div border="1px solid red"></div>`)
  assert.deepEqual(template({}, escape), '<div style="border: 1px solid red;"></div>')

  template = await compile(`<div border-left="1px solid red"></div>`)
  assert.deepEqual(template({}, escape), '<div style="border-left: 1px solid red;"></div>')

  template = await compile(`<div borderLeft="1px solid red"></div>`)
  assert.deepEqual(template({}, escape), '<div style="border-left: 1px solid red;"></div>')

  template = await compile(`<div border-top="2px" border-bottom="2px"></div>`)
  assert.deepEqual(template({}, escape), '<div style="border-top: 2px; border-bottom: 2px;"></div>')

  template = await compile(`<div border="coolBorder"></div>`, {
    style: {
      variables: {
        coolBorder: '1px solid black'
      }
    }
  })
  assert.deepEqual(template({}, escape), '<div style="border: 1px solid black;"></div>')
})
