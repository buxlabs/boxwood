const test = require('ava')
const compile = require('../helpers/compile')

test('compiler: returns errors for invalid paths option', async assert => {
  var { errors } = await compile('', { paths: 'foo' })
  assert.deepEqual(errors.length, 1)
  assert.deepEqual(errors[0].message, 'Compiler option "paths" must be an array')

  var { errors } = await compile('', { paths: [null, 447] })
  assert.deepEqual(errors.length, 1)
  assert.deepEqual(errors[0].message, 'Compiler option "paths" must contain only strings')

  var { errors } = await compile('', { paths: ['foo/bar', ''] })
  assert.deepEqual(errors.length, 1)
  assert.deepEqual(errors[0].message, 'Compiler option "paths" cannot contain empty strings')

  var { errors } = await compile('', { paths: [__dirname, './foo/bar/baz'] })
  assert.deepEqual(errors, [])
})

test('compiler: returns errors for invalid languages option', async assert => {
  var { errors } = await compile('', { languages: 'foo' })
  assert.deepEqual(errors.length, 1)
  assert.deepEqual(errors[0].message, 'Compiler option "languages" must be an array')

  var { errors } = await compile('', { languages: [null, 447] })
  assert.deepEqual(errors.length, 1)
  assert.deepEqual(errors[0].message, 'Compiler option "languages.language" must be a string')

  var { errors } = await compile('', { languages: ['pl', 'en'] })
  assert.deepEqual(errors, [])
})

test('compiler: returns errors for invalid cache option', async assert => {
  var { errors } = await compile('', { cache: 'foo' })
  assert.deepEqual(errors.length, 1)
  assert.deepEqual(errors[0].message, 'Compiler option "cache" must be an boolean')

  var { errors } = await compile('', { cache: true })
  assert.deepEqual(errors, [])
})

test('compiler: caches templates and related data', async assert => {
  const output1 = await compile('<div>foo</div>', { cache: true })
  const output2 = await compile('<div>foo</div>', { cache: true })
  const output3 = await compile('<div>{bar}</div>', { cache: true })
  assert.deepEqual(output1.from, 'generator')
  assert.deepEqual(output2.from, 'cache')
  assert.deepEqual(output3.from, 'generator')
})
