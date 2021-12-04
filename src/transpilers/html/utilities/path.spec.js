const test = require('ava')
const { pathToIdentifier } = require('./path')

test('pathToIdentifier: flat path', assert => {
  assert.deepEqual(pathToIdentifier('foo.html'), '__fooDotHtml__')
})

test('pathToIdentifier: relative path', assert => {
  assert.deepEqual(pathToIdentifier('./foo.html'), '__dotSlashFooDotHtml__')
})

test('pathToIdentifier: nested path', assert => {
  assert.deepEqual(pathToIdentifier('components/foo.html'), '__componentsSlashFooDotHtml__')
})

test('pathToIdentifier: backward path', assert => {
  assert.deepEqual(pathToIdentifier('../foo.html'), '__dotDotSlashFooDotHtml__')
})
