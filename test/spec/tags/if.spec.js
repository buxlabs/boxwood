const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

test.skip('if', async assert => {
  var { template, warnings } = await compile('<if foo>bar</if>')
  assert.deepEqual(template({ foo: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if>')
  assert.deepEqual(template({ foo: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if>')
  assert.deepEqual(template({ foo: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if>')
  assert.deepEqual(template({ foo: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><if baz>qux</if>')
  assert.deepEqual(template({ foo: true, baz: true }, escape), 'barqux')
  assert.deepEqual(warnings, [])


  var { template, warnings } = await compile('<if foo>bar</if><if baz>qux</if>')
  assert.deepEqual(template({ foo: true, baz: false }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><if baz>qux</if>')
  assert.deepEqual(template({ foo: false, baz: true }, escape), 'qux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><if baz>qux</if>')
  assert.deepEqual(template({ foo: false, baz: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo.length>bar</if>')
  assert.deepEqual(template({ foo: [] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo.length>bar</if>')
  assert.deepEqual(template({ foo: [] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo.length>bar</if>')
  assert.deepEqual(template({ foo: ['baz'] }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo.length>bar</if>')
  assert.deepEqual(template({ foo: ['baz'] }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><else>baz</else>')
  assert.deepEqual(template({ foo: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><else>baz</else>')
  assert.deepEqual(template({ foo: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif>')
  assert.deepEqual(template({ foo: true, baz: false }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif>')
  assert.deepEqual(template({ foo: true, baz: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif>')
  assert.deepEqual(template({ foo: false, baz: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif>')
  assert.deepEqual(template({ foo: false, baz: true }, escape), 'qux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')
  assert.deepEqual(template({ foo: true, baz: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')
  assert.deepEqual(template({ foo: true, baz: false }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')
  assert.deepEqual(template({ foo: false, baz: false }, escape), 'quux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')
  assert.deepEqual(template({ foo: false, baz: true }, escape), 'qux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: true, baz: true, quux: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: true, baz: false, quux: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: true, baz: false, quux: false }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: false, baz: true, quux: false }, escape), 'qux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: false, baz: true, quux: true }, escape), 'qux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: false, baz: false, quux: true }, escape), 'corge')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: false, baz: false, quux: true }, escape), 'corge')
  assert.deepEqual(warnings, [])
})

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
