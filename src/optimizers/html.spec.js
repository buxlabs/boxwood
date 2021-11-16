const test = require('ava')
const { optimize } = require('./html')

test('optimize: trims html', assert => {
  assert.deepEqual(optimize('  <div></div>   '), '<div></div>')
})
