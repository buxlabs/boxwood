const test = require('ava')
const { optimize } = require('./html')

test('optimize: trims html', assert => {
  assert.deepEqual(optimize('  <div></div>   '), '<div></div>')
})

test('optimize: collapses whitespaces conservatively', assert => {
  assert.deepEqual(optimize('   <div>    </div>   '), '<div> </div>')
})

test('optimize: removes comments', assert => {
  assert.deepEqual(optimize('<!-- foo -->'), '')
})

test('optimize: sorts attributes', assert => {
  assert.deepEqual(optimize('<div id="foo" class="bar"></div>'), '<div class="bar" id="foo"></div>')
})

test('optimize: sorts classes', assert => {
  assert.deepEqual(optimize('<div class="foo bar"></div>'), '<div class="bar foo"></div>')
})
