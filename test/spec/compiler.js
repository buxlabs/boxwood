import test from 'ava'
import compile from '../helpers/compile'

test('compiler: returns errors for invalid paths option', async assert => {
  var { errors } = await compile('', { paths: 'foo' })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0], 'Compiler option "paths" must be an array')

  var { errors } = await compile('', { paths: [null, 447] })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0], 'Compiler option "paths" must contain only strings')

  var { errors } = await compile('', { paths: ['foo/bar', ''] })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0], 'Compiler option "paths" cannot contains empty strings')

  var { errors } = await compile('', { paths: [__dirname, './foo/bar/baz'] })
  assert.deepEqual(errors, [])  
})

test('compiler: returns errors for invalid inline options', async assert => {
  var { errors } = await compile('', { inline: 'foo' })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0], 'Compiler option inline must be an array')

  var { errors } = await compile('', { inline: ['images', 'fonts', 'scripts'] })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0], 'Inline option must be one of ["images", "scripts", "stylesheets"]')
  
  var { errors } = await compile('', { inline: ['images', 'scripts'] })
  assert.deepEqual(errors, [])    

  var { errors } = await compile('', { inline: [] })
  assert.deepEqual(errors, [])
})

test('compiler: returns errors for invalid compilers options', async assert => {
  var { errors } = await compile('', { compilers: [] })
  assert.deepEqual(errors.length, 1)
  assert.deepEqual(errors[0], 'Compiler option "compilers" must be an object')
  
  var { errors } = await compile('', { compilers: null })
  assert.deepEqual(errors.length, 1)
  assert.deepEqual(errors[0], 'Compiler option "compilers" must be an object')
  
  var { errors } = await compile('', { compilers: { foo: 'foo' } })
  assert.deepEqual(errors.length, 1)
  assert.deepEqual(errors[0], 'Compiler option "compilers" must contain only functions')

  var { errors } = await compile('', { compilers: { foo () {} }})
  assert.deepEqual(errors, [])
})

test('compiler: returns errors for invalid languages option', async assert => {
  var { errors } = await compile('', { languages: 'foo' })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0], 'Compiler option "languages" must be an array')

  var { errors } = await compile('', { languages: [null, 447] })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0], 'Compiler option "languages" must contain only strings')
  
  var { errors } = await compile('', { languages: ['pl', 'en'] })
  assert.deepEqual(errors, [])  
})

test('compiler: returns errors for invalid cache option', async assert => {
  var { errors } = await compile('', { cache: 'foo' })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0], 'Compiler option "cache" must be an boolean')
  
  var { errors } = await compile('', { cache: true })
  assert.deepEqual(errors, [])  
})

test('compiler: returns errors for invalid aliases option', async assert => {
  var { errors } = await compile('', { aliases: 'foo' })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0], 'Compiler option "aliases" must be an array')

  var { errors } = await compile('', { aliases: ['foo'] })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0], 'An "alias" must be an object')  
  
  var { errors } = await compile('', { aliases: [{}] })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0], 'An alias cannot be an empty object')
  
  var { errors } = await compile('', { aliases: [{ foo: '', bar: '' }] })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0], 'An alias must have "from" and "to" property')
  
  var { errors } = await compile('', { aliases: [{ from: '', to: '' }] })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0], 'An alias "from" option must be an regexp')
     
  var { errors } = await compile('', { aliases: [{ from: /baz/, to: null }] })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0], 'An alias "to" option must be an string')  
})

test('compiler: returns errors for invalid styles option', async assert => {
  var { errors } = await compile('', { styles: [] })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0], 'Compiler option "styles" must be an object')
})