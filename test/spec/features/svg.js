import test from 'ava'
import compile from '../../helpers/compile'

test('svg', async assert => {
  let template
  console.time('svg')

  template = await compile('<svg from="../../fixtures/svg/rectangle.svg" />', { paths: [__dirname] })
  assert.deepEqual(template({}, html => html), '<svg width="400" height="100"><rect width="400" height="100" style="fill:rgb(0,0,255);stroke-width:10;stroke:rgb(0,0,0)"></rect></svg>')

  template = await compile('<svg from="../../fixtures/svg/stroke.svg" />', { paths: [__dirname] })
  assert.deepEqual(template({}, html => html), '<svg height="80" width="300"><g fill="none"><path stroke="red" d="M5 20 l215 0"></path></g></svg>')

  // try {
  //   template = await compile(`<svg from=''/><div>`, { paths: [__dirname] })
  // } catch (error) {
  //   assert.regex(error.message, /Attribute empty on the svg tag: from\./)
  // }

  // try {
  //   template = await compile(`<svg from='../circle.svg'/><div>`, {})
  // } catch (error) {
  //   assert.regex(error.message, /Compiler option is undefined: paths\./)
  // }

  // try {
  //   template = await compile(`<svg from='../circle.svg'/><div>`, { paths: [] })
  // } catch (error) {
  //   assert.regex(error.message, /Asset not found: \.\.\/circle\.svg/)
  // }
  console.timeEnd('svg')
})
