const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

test('spacing: small', async assert => {
  var { template } = await compile(`<spacing small>`)
  assert.deepEqual(template({}, escape), '<div style="height:5px"></div>')

  var { template } = await compile(`<spacing small>`, {
    styles: {
      spacing: {
        small: '25px'
      }
    }
  })
  assert.deepEqual(template({}), '<div style="height:25px"></div>')
})

test('spacing: medium', async assert => {
  var { template } = await compile(`<spacing medium>`)
  assert.deepEqual(template({}, escape), '<div style="height:15px"></div>')

  var { template } = await compile(`<spacing medium>`, {
    styles: {
      spacing: {
        medium: '50px'
      }
    }
  })
  assert.deepEqual(template({}, escape), '<div style="height:50px"></div>')
})

test('spacing: large', async assert => {
  var { template } = await compile(`<spacing large>`)
  assert.deepEqual(template({}, escape), '<div style="height:60px"></div>')

  var { template } = await compile(`<spacing large>`, {
    styles: {
      spacing: {
        large: '120px'
      }
    }
  })
  assert.deepEqual(template({}, escape), '<div style="height:120px"></div>')
})
