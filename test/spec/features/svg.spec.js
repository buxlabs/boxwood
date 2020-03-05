const test = require('ava')
const compile = require('../../helpers/compile')
const escape = require('escape-html')

test('svg can be imported', async assert => {
  var { template } = await compile('<svg from="../../fixtures/svg/rectangle.svg" />', { paths: [__dirname] })
  assert.deepEqual(template({}, escape), '<svg width="400" height="100"><rect width="400" height="100" style="fill:rgb(0,0,255);stroke-width:10;stroke:rgb(0,0,0)"></rect></svg>')
})

test('svg import throws if the asset does not exist', async assert => {
  var { template } = await compile(`<svg from='../circle.svg'/>`, { paths: [] })
  assert.deepEqual(template({}, escape), '')
})

test('svg import throws if the from attribute is empty', async assert => {
  var { errors } = await  compile(`<svg from=''/>`, { paths: [__dirname] })
  assert.regex(errors[0].message, /Attribute empty on the svg tag: from\./)
})
