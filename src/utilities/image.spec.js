const test = require('ava')
const { join } = require('path')
const { readFile } = require('./files')
const { optimizeImageByProgressiveScan } = require('./image')

test('optimizeImageByProgressiveScan: it successfully optimizes jpeg images', async assert => {
  const location = join(__dirname, '../../test/fixtures/images/placeholder.jpg')
  const buffer = await readFile(location)
  const newBuffer = await optimizeImageByProgressiveScan(buffer)
  assert.truthy(newBuffer.length < buffer.length)
})

test('optimizeImageByProgressiveScan: it successfully optimizes png images', async assert => {
  const location = join(__dirname, '../../test/fixtures/images/example.png')
  const buffer = await readFile(location)
  const newBuffer = await optimizeImageByProgressiveScan(buffer)
  assert.truthy(newBuffer.length < buffer.length)
})

test('optimizeImageByProgressiveScan: it crashes for unsupported extensions', async assert => {
  const location = join(__dirname, '../../test/fixtures/fonts/Example.ttf')
  const buffer = await readFile(location)
  await assert.throwsAsync(async () => {
    await optimizeImageByProgressiveScan(buffer)
  }, { instanceOf: Error, message: 'Input buffer contains unsupported image format' })
})
