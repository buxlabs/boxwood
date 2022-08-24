const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

test('if: true in a curly tag', async assert => {
  const { template } = await compile(`<if {true}>foo</if>`)
  assert.deepEqual(template({}, escape), 'foo')
})

test('if: true without a tag', async assert => {
  const { template } = await compile(`<if true>foo</if>`)
  assert.deepEqual(template({}, escape), 'foo')
})

test('if: false in a curly tag', async assert => {
  const { template } = await compile(`<if {false}>foo</if>`)
  assert.deepEqual(template({}, escape), '')
})

test('if: false without a tag', async assert => {
  const { template } = await compile(`<if false>foo</if>`)
  assert.deepEqual(template({}, escape), '')
})

test('if: true in a curly tag and else tag', async assert => {
  const { template } = await compile(`<if {true}>foo<else>bar</if>`)
  assert.deepEqual(template({}, escape), 'foo')
})

test('if: true without a tag and else tag', async assert => {
  const { template } = await compile(`<if true>foo<else>bar</if>`)
  assert.deepEqual(template({}, escape), 'foo')
})

test('if: false in a curly tag and else tag', async assert => {
  const { template } = await compile(`<if {false}>foo</if><else>bar</else>`)
  assert.deepEqual(template({}, escape), 'bar')
})

test('if: false without a tag and else tag', async assert => {
  const { template } = await compile(`<if false>foo</if><else>bar</else>`)
  assert.deepEqual(template({}, escape), 'bar')
})
