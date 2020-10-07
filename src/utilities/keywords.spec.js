const test = require('ava')
const { addPlaceholders } = require('./keywords')

test('addPlaceholders: for attribute', assert => {
  const input = '<label for="foo">bar</label>'
  const output = '<label __FOR_PLACEHOLDER__="foo">bar</label>'
  assert.deepEqual(addPlaceholders(input), output)
})

test('addPlaceholders: for inside of a text', assert => {
  const html = `<a href="{route('blog/plants-for-winter')}">bar</a>`
  assert.deepEqual(addPlaceholders(html), html)
})
