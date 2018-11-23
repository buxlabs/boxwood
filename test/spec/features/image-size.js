import test from '../../helpers/test'
import compile from '../../helpers/compile'

test('image-size: it works for the png extension', async assert => {
  const template = await compile('<img src="../../fixtures/images/placeholder.png" width="auto" height="auto">', { paths: [__dirname] })
  assert.deepEqual(template({}, html => html), '<img src="../../fixtures/images/placeholder.png" width="250" height="250">')
})

test('image-size: it works for the jpg extension', async assert => {
  const template = await compile('<img src="../../fixtures/images/placeholder.jpg" width="auto" height="auto">', { paths: [__dirname] })
  assert.deepEqual(template({}, html => html), '<img src="../../fixtures/images/placeholder.jpg" width="250" height="250">')
})

test('image-size: it works for the svg extension', async assert => {
  const template = await compile('<img src="../../fixtures/images/placeholder.svg" width="auto" height="auto">', { paths: [__dirname] })
  assert.deepEqual(template({}, html => html), '<img src="../../fixtures/images/placeholder.svg" width="400" height="100">')
})

test('image-size: it handles the size attribute', async assert => {
  const template = await compile('<img src="../../fixtures/images/placeholder.svg" size="1600x800">', { paths: [__dirname] })
  assert.deepEqual(template({}, html => html), '<img src="../../fixtures/images/placeholder.svg" width="1600" height="800">')
})
