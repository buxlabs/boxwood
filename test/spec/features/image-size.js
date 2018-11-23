import test from '../../helpers/test'
import compile from '../../helpers/compile'

test('image-size', async assert => {
  let template

  template = await compile('<img src="../../fixtures/images/placeholder.png" width="auto" height="auto">', { paths: [__dirname] })
  assert.deepEqual(template({}, html => html), '<img src="../../fixtures/images/placeholder.png" width="250" height="250">')

  template = await compile('<img src="../../fixtures/images/placeholder.jpg" width="auto" height="auto">', { paths: [__dirname] })
  assert.deepEqual(template({}, html => html), '<img src="../../fixtures/images/placeholder.jpg" width="250" height="250">')

  template = await compile('<img src="../../fixtures/images/placeholder.svg" width="auto" height="auto">', { paths: [__dirname] })
  assert.deepEqual(template({}, html => html), '<img src="../../fixtures/images/placeholder.svg" width="400" height="100">')

  template = await compile('<img src="../../fixtures/images/placeholder.svg" size="1600x800">', { paths: [__dirname] })
  assert.deepEqual(template({}, html => html), '<img src="../../fixtures/images/placeholder.svg" width="1600" height="800">')

  template = await compile('<img src="../../fixtures/images/placeholder.jpg" size="400x400">', { paths: [__dirname] })
  assert.deepEqual(template({}, html => html), '<img src="../../fixtures/images/placeholder.jpg" width="400" height="400">')
})
