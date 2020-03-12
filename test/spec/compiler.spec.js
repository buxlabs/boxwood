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

test('compiler: returns errors for invalid inline options', async assert => {
  var { errors } = await compile('', { inline: 'foo' })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0].message, 'Compiler option "inline" must be an array')

  var { errors } = await compile('', { inline: ['images', 'fonts', 'scripts'] })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0].message, 'Compiler option "inline" can contain ["images", "scripts", "stylesheets"]')
  
  var { errors } = await compile('', { inline: ['images', 'scripts'] })
  assert.deepEqual(errors, [])    

  var { errors } = await compile('', { inline: [] })
  assert.deepEqual(errors, [])
})

test('compiler: returns errors for invalid compilers options', async assert => {
  var { errors } = await compile('', { compilers: [] })
  assert.deepEqual(errors.length, 1)
  assert.deepEqual(errors[0].message, 'Compiler option "compilers" must be an object')
  
  var { errors } = await compile('', { compilers: null })
  assert.deepEqual(errors.length, 1)
  assert.deepEqual(errors[0].message, 'Compiler option "compilers" must be an object')
  
  var { errors } = await compile('', { compilers: { foo: 'foo' } })
  assert.deepEqual(errors.length, 1)
  assert.deepEqual(errors[0].message, 'Compiler option "compilers" must contain only functions')

  var { errors } = await compile('', { compilers: { foo () {} }})
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

test('compiler: returns errors for invalid aliases option', async assert => {
  var { errors } = await compile('', { aliases: 'foo' })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0].message, 'Compiler option "aliases" must be an array')

  var { errors } = await compile('', { aliases: ['foo'] })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0].message, 'Compiler option "aliases.alias" must be an object')  
  
  var { errors } = await compile('', { aliases: [{}] })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0].message, 'Compiler option "aliases.alias" cannot be an empty object')
  
  var { errors } = await compile('', { aliases: [{ foo: '', bar: '' }] })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0].message, 'Compiler option "aliases.alias" must have "from" and "to" property')
  
  var { errors } = await compile('', { aliases: [{ from: '', to: '' }] })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0].message, 'Compiler option "aliases.alias.from" must be a regexp')
     
  var { errors } = await compile('', { aliases: [{ from: /baz/, to: null }] })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0].message, 'Compiler option "aliases.alias.to" must be a string')  
})

test('compiler: returns errors for invalid styles option', async assert => {
  var { errors } = await compile('', { styles: [] })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0].message, 'Compiler option "styles" must be an object')

  var { errors } = await compile('', { styles: { colors: [] } } )
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0].message, 'Compiler option "styles.colors" must be an object')

  var { errors } = await compile('', { styles: {} } )
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0].message, 'Compiler option "styles.spacing" must be an object')
  
  var { errors } = await compile('', { styles: { spacing: [] } } )
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0].message, 'Compiler option "styles.spacing" must be an object')
  
  var { errors } = await compile('', { 
    styles: { 
      spacing: {
        nano: '0.1px'
      }  
    } 
  })
  assert.deepEqual(errors.length, 1) 
  assert.deepEqual(errors[0].message, `Compiler option "styles.spacing.nano" allowed options: small, medium, large`)      
})

test('compiler: caches templates and related data', async assert => {
  const output1 = await compile('<div>foo</div>', { cache: true })
  const output2 = await compile('<div>foo</div>', { cache: true })
  const output3 = await compile('<div>bar</div>', { cache: true })
  assert.deepEqual(output1.from, 'generator')
  assert.deepEqual(output2.from, 'cache')
  assert.deepEqual(output3.from, 'generator')
})
