import test from 'ava'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('svg can be imported', async assert => {
  var { template } = await compile('<svg from="../../fixtures/svg/rectangle.svg" />', { paths: [__dirname] })
  assert.deepEqual(template({}, escape), '<svg width="400" height="100"><rect width="400" height="100" style="fill:rgb(0,0,255);stroke-width:10;stroke:rgb(0,0,0)"></rect></svg>')
})

test('svg import throws if the asset does not exist', async assert => {
  var { template } = await compile(`<svg from='../circle.svg'/>`, { paths: [] })
  assert.deepEqual(template({}, escape), '')
})

test('svg import throws if the from attribute is empty', async assert => {
  await assert.throwsAsync(
    compile(`<svg from=''/>`, { paths: [__dirname] }),
    /Attribute empty on the svg tag: from\./
  )
})

