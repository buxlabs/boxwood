const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

test('if', async assert => {
  var { template, warnings } = await compile('<if foo>bar</if>')
  assert.deepEqual(template({ foo: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<end>')
  assert.deepEqual(template({ foo: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if>')
  assert.deepEqual(template({ foo: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<end>')
  assert.deepEqual(template({ foo: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><if baz>qux</if>')
  assert.deepEqual(template({ foo: true, baz: true }, escape), 'barqux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<end><if baz>qux<end>')
  assert.deepEqual(template({ foo: true, baz: true }, escape), 'barqux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><if baz>qux</if>')
  assert.deepEqual(template({ foo: true, baz: false }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<end><if baz>qux<end>')
  assert.deepEqual(template({ foo: true, baz: false }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><if baz>qux</if>')
  assert.deepEqual(template({ foo: false, baz: true }, escape), 'qux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<end><if baz>qux<end>')
  assert.deepEqual(template({ foo: false, baz: true }, escape), 'qux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><if baz>qux</if>')
  assert.deepEqual(template({ foo: false, baz: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<end><if baz>qux<end>')
  assert.deepEqual(template({ foo: false, baz: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo.length>bar</if>')
  assert.deepEqual(template({ foo: [] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo.length>bar<end>')
  assert.deepEqual(template({ foo: [] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo.length>bar</if>')
  assert.deepEqual(template({ foo: ['baz'] }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo.length>bar<end>')
  assert.deepEqual(template({ foo: ['baz'] }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><else>baz</else>')
  assert.deepEqual(template({ foo: false }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<else>baz<end>')
  assert.deepEqual(template({ foo: false }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><else>baz</else>')
  assert.deepEqual(template({ foo: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<else>baz<end>')
  assert.deepEqual(template({ foo: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif>')
  assert.deepEqual(template({ foo: true, baz: false }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<elseif baz>qux<end>')
  assert.deepEqual(template({ foo: true, baz: false }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif>')
  assert.deepEqual(template({ foo: true, baz: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<elseif baz>qux<end>')
  assert.deepEqual(template({ foo: true, baz: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif>')
  assert.deepEqual(template({ foo: false, baz: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<elseif baz>qux<end>')
  assert.deepEqual(template({ foo: false, baz: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif>')
  assert.deepEqual(template({ foo: false, baz: true }, escape), 'qux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<elseif baz>qux<end>')
  assert.deepEqual(template({ foo: false, baz: true }, escape), 'qux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')
  assert.deepEqual(template({ foo: true, baz: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<elseif baz>qux<else>quux<end>')
  assert.deepEqual(template({ foo: true, baz: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')
  assert.deepEqual(template({ foo: true, baz: false }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<elseif baz>qux<else>quux<end>')
  assert.deepEqual(template({ foo: true, baz: false }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')
  assert.deepEqual(template({ foo: false, baz: false }, escape), 'quux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<elseif baz>qux<else>quux<end>')
  assert.deepEqual(template({ foo: false, baz: false }, escape), 'quux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')
  assert.deepEqual(template({ foo: false, baz: true }, escape), 'qux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<elseif baz>qux<else>quux<end>')
  assert.deepEqual(template({ foo: false, baz: true }, escape), 'qux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: true, baz: true, quux: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<elseif baz>qux<elseif quux>corge<end>')
  assert.deepEqual(template({ foo: true, baz: true, quux: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: true, baz: false, quux: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<elseif baz>qux<elseif quux>corge<end>')
  assert.deepEqual(template({ foo: true, baz: false, quux: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: true, baz: false, quux: false }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<elseif baz>qux<elseif quux>corge<end>')
  assert.deepEqual(template({ foo: true, baz: false, quux: false }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: false, baz: true, quux: false }, escape), 'qux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<elseif baz>qux<elseif quux>corge<end>')
  assert.deepEqual(template({ foo: false, baz: true, quux: false }, escape), 'qux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: false, baz: true, quux: true }, escape), 'qux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<elseif baz>qux<elseif quux>corge<end>')
  assert.deepEqual(template({ foo: false, baz: true, quux: true }, escape), 'qux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: false, baz: false, quux: true }, escape), 'corge')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<elseif baz>qux<elseif quux>corge<end>')
  assert.deepEqual(template({ foo: false, baz: false, quux: true }, escape), 'corge')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: false, baz: false, quux: true }, escape), 'corge')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar<elseif baz>qux<elseif quux>corge<end>')
  assert.deepEqual(template({ foo: false, baz: false, quux: true }, escape), 'corge')
  assert.deepEqual(warnings, [])
})

test('if: conditions', async assert => {
  var { template, warnings } = await compile('<if foo and bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: true }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo and bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: true }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo and bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo and bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo nand bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: true }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo nand bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: true }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo or bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: true }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo or bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: true }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo or bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: false }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo or bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: true }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo or bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo xor bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: true }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo xor bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: false }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo xor bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo xor bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: true }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo nor bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: true }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo nor bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: false }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo eq bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 42 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo eq bar>baz</if>')
  assert.deepEqual(template({ foo: 40, bar: 42 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo eq bar>baz</if>')
  assert.deepEqual(template({ foo: '42', bar: 42 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo neq bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 42 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo neq bar>baz</if>')
  assert.deepEqual(template({ foo: 40, bar: 42 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo neq bar>baz</if>')
  assert.deepEqual(template({ foo: '42', bar: 42 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo neq="bar">baz</if>')
  assert.deepEqual(template({ foo: 'bar', bar: 'bar' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo neq="{42}">baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 42 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo neq="bar">baz</if>')
  assert.deepEqual(template({ foo: 'qux', bar: 'bar' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo neq="{42}">baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 42 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is equal to="bar">baz</if>')
  assert.deepEqual(template({ foo: 'bar', bar: 'bar' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is equal to="{42}">baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 42 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is equal to="bar">baz</if>')
  assert.deepEqual(template({ foo: 'qux', bar: 'bar' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is equal to="{42}">baz</if>')
  assert.deepEqual(template({ foo: 10, bar: '42' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not equal to="bar">baz</if>')
  assert.deepEqual(template({ foo: 'bar', bar: 'bar' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not equal to="{42}">baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 42 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not equal to="bar">baz</if>')
  assert.deepEqual(template({ foo: 'qux', bar: 'bar' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not equal to="{42}">baz</if>')
  assert.deepEqual(template({ foo: 10, bar: '42' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo gt bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 30 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo gt two>baz</if>')
  assert.deepEqual(template({ foo: 42 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo gt two>baz</if>')
  assert.deepEqual(template({ foo: 1 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo gt bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 42 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo gt bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 50 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo gte bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 30 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo gte bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 42 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo gte bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 50 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo lt bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 30 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo lt bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 42 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo lt bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 50 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo lte bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 30 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo lte bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 42 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo lte bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 50 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo lte="{bar.baz - 2}">baz</if>')
  assert.deepEqual(template({ foo: 2, bar: { baz: 10 } }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo lte="{bar.baz - 2}">baz</if>')
  assert.deepEqual(template({ foo: 100, bar: { baz: 10 } }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo equals bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 42 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo equals bar>baz</if>')
  assert.deepEqual(template({ foo: 40, bar: 42 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo equals bar>baz</if>')
  assert.deepEqual(template({ foo: '42', bar: 42 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is less than bar>baz</if>')
  assert.deepEqual(template({ foo: 100, bar: 50 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is less than bar>baz</if>')
  assert.deepEqual(template({ foo: 50, bar: 50 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is less than bar>baz</if>')
  assert.deepEqual(template({ foo: 30, bar: 40 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is less than or equals bar>baz</if>')
  assert.deepEqual(template({ foo: 30, bar: 40 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is less than or equals bar>baz</if>')
  assert.deepEqual(template({ foo: 40, bar: 30 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is less than or equals bar>baz</if>')
  assert.deepEqual(template({ foo: 30, bar: 30 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is greater than bar>baz</if>')
  assert.deepEqual(template({ foo: 100, bar: 30 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is greater than bar>baz</if>')
  assert.deepEqual(template({ foo: 50, bar: 50 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is greater than bar>baz</if>')
  assert.deepEqual(template({ foo: 30, bar: 50 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is greater than or equals bar>baz</if>')
  assert.deepEqual(template({ foo: 30, bar: 40 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is greater than or equals bar>baz</if>')
  assert.deepEqual(template({ foo: 40, bar: 40 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is greater than or equals bar>baz</if>')
  assert.deepEqual(template({ foo: 50, bar: 40 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not greater than bar>baz</if>')
  assert.deepEqual(template({ foo: 100, bar: 100 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not greater than bar>baz</if>')
  assert.deepEqual(template({ foo: 90, bar: 100 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not greater than bar>baz</if>')
  assert.deepEqual(template({ foo: 110, bar: 100 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not greater than five>baz</if>')
  assert.deepEqual(template({ foo: 5 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not greater than five>baz</if>')
  assert.deepEqual(template({ foo: 4 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not greater than five>baz</if>')
  assert.deepEqual(template({ foo: 6 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo[bar]>baz</if>')
  assert.deepEqual(template({ foo: { bar: true }, bar: 'bar' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo[bar]>baz</if>')
  assert.deepEqual(template({ foo: { bar: false }, bar: 'bar' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo["bar"].baz>ban</if>')
  assert.deepEqual(template({ foo: { bar: { baz: 'baz' } } }, escape), 'ban')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo["bar"].baz>ban</if>')
  assert.deepEqual(template({ foo: { bar: {} } }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if not foo["bar"].baz>ban</if>')
  assert.deepEqual(template({ foo: { bar: {} } }, escape), 'ban')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo[qux].baz>ban</if>')
  assert.deepEqual(template({ foo: { bar: { baz: 'baz' } }, qux: 'bar' }, escape), 'ban')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo().bar("baz")>baz</if>')
  assert.deepEqual(template({ foo () { return { bar (string) { return string } } } }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo().bar("")>baz</if>')
  assert.deepEqual(template({ foo () { return { bar (string) { return string } } } }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is present>bar</if>')
  assert.deepEqual(template({ foo: null }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is present>bar</if>')
  assert.deepEqual(template({ foo: false }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is present>bar</if>')
  assert.deepEqual(template({ foo: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is present>bar</if>')
  assert.deepEqual(template({ foo: {} }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is present>bar</if>')
  assert.deepEqual(template({ foo: undefined }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo.bar is not present>baz</if>')
  assert.deepEqual(template({ foo: '' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo.bar is not present>baz</if>')
  assert.deepEqual(template({ foo: { bar: 'baz' } }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not present>baz</if>')
  assert.deepEqual(template({}, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not present>bar</if>')
  assert.deepEqual(template({ foo: undefined }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is defined>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is defined>{bar}</if>')
  assert.deepEqual(template({ foo: {}, bar: 'ban' }, escape), 'ban')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is defined>{bar}</if>')
  assert.deepEqual(template({ foo: null, bar: null }, escape), 'null')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is defined>baz</if>')
  assert.deepEqual(template({ foo: undefined }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo are present>bar</if>')
  assert.deepEqual(template({ foo: [] }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo are present>bar</if>')
  assert.deepEqual(template({ foo: 'qux' }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo are not present>bar</if>')
  assert.deepEqual(template({ foo: undefined }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo are not present>bar</if>')
  assert.deepEqual(template({ foo: [] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo are not present>bar</if>')
  assert.deepEqual(template({ foo: 'qux' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is positive>baz</if>')
  assert.deepEqual(template({ foo: 1 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is positive>baz</if>')
  assert.deepEqual(template({ foo: 0 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is positive>baz</if>')
  assert.deepEqual(template({ foo: -1 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is_positive>baz</if>')
  assert.deepEqual(template({ foo: 1 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not positive>baz</if>')
  assert.deepEqual(template({ foo: 1 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not positive>baz</if>')
  assert.deepEqual(template({ foo: 0 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not positive>baz</if>')
  assert.deepEqual(template({ foo: -1 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is alpha>baz</if>')
  assert.deepEqual(template({ foo: 'bar' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is alpha>baz</if>')
  assert.deepEqual(template({ foo: '' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is alpha>baz</if>')
  assert.deepEqual(template({ foo: 'BaR' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is alpha>baz</if>')
  assert.deepEqual(template({ foo: '123' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is alpha>baz</if>')
  assert.deepEqual(template({ foo: 'bar baz' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not alpha>baz</if>')
  assert.deepEqual(template({ foo: 'bar' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not alpha>baz</if>')
  assert.deepEqual(template({ foo: '' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not alpha>baz</if>')
  assert.deepEqual(template({ foo: 'BaR' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not alpha>baz</if>')
  assert.deepEqual(template({ foo: '123' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not alpha>baz</if>')
  assert.deepEqual(template({ foo: 'bar baz' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not alphanumeric>baz</if>')
  assert.deepEqual(template({ foo: '1234' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not alphanumeric>baz</if>')
  assert.deepEqual(template({ foo: '' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not alphanumeric>baz</if>')
  assert.deepEqual(template({ foo: '1234bar' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is negative>baz</if>')
  assert.deepEqual(template({ foo: 1 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is negative>baz</if>')
  assert.deepEqual(template({ foo: 0 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is negative>baz</if>')
  assert.deepEqual(template({ foo: -1 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not negative>baz</if>')
  assert.deepEqual(template({ foo: 1 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not negative>baz</if>')
  assert.deepEqual(template({ foo: 0 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not negative>baz</if>')
  assert.deepEqual(template({ foo: -1 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is finite>baz</if>')
  assert.deepEqual(template({ foo: 100 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is finite>baz</if>')
  assert.deepEqual(template({ foo: Infinity }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is finite>baz</if>')
  assert.deepEqual(template({ foo: -Infinity }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is finite>baz</if>')
  assert.deepEqual(template({ foo: 0 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is finite>baz</if>')
  assert.deepEqual(template({ foo: NaN }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is finite>baz</if>')
  assert.deepEqual(template({ foo: 2e64 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not finite>baz</if>')
  assert.deepEqual(template({ foo: 100 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not finite>baz</if>')
  assert.deepEqual(template({ foo: Infinity }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not finite>baz</if>')
  assert.deepEqual(template({ foo: -Infinity }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is infinite>baz</if>')
  assert.deepEqual(template({ foo: 100 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is infinite>baz</if>')
  assert.deepEqual(template({ foo: Infinity }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is infinite>baz</if>')
  assert.deepEqual(template({ foo: -Infinity }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is infinite>baz</if>')
  assert.deepEqual(template({ foo: 0 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is infinite>baz</if>')
  assert.deepEqual(template({ foo: NaN }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is infinite>baz</if>')
  assert.deepEqual(template({ foo: 2e1000 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not infinite>baz</if>')
  assert.deepEqual(template({ foo: Infinity }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not infinite>baz</if>')
  assert.deepEqual(template({ foo: -Infinity }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: [] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: [{ baz: 'bar' }, {}] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: '' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: 'qux' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: null }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: undefined }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: { bar: null } }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: { 1: 'bar', 2: 'baz' } }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: { bar: 'ban' } }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: function () {} }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: new Map() }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: new Map([['foo', 'bar'], ['baz', 'ban']]) }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: new Set() }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: new Set([1, 'foo', 'bar']) }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: [] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: [{ baz: 'bar' }, {}] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: '' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: 'qux' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: null }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: undefined }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: { bar: null } }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: { 1: 'bar', 2: 'baz' } }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: { bar: 'ban' } }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: function () {} }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: new Map() }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: new Map([['foo', 'bar'], ['baz', 'ban']]) }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: new Set() }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: new Set([1, 'foo', 'bar']) }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo are empty>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo are empty>baz</if>')
  assert.deepEqual(template({ foo: [[], [], []] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo are empty>baz</if>')
  assert.deepEqual(template({ foo: [{ baz: 'bar' }, {}] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo are not empty>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo are not empty>baz</if>')
  assert.deepEqual(template({ foo: [[], [], []] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo are not empty>baz</if>')
  assert.deepEqual(template({ foo: [{ baz: 'bar' }, {}] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an empty array>baz</if>')
  assert.deepEqual(template({ foo: [] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an empty array>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not an empty array>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an empty string>baz</if>')
  assert.deepEqual(template({ foo: '' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an empty string>baz</if>')
  assert.deepEqual(template({ foo: 'foo' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not an empty string>baz</if>')
  assert.deepEqual(template({ foo: 'foo' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an empty set>baz</if>')
  assert.deepEqual(template({ foo: new Set([]) }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an empty set>baz</if>')
  assert.deepEqual(template({ foo: new Set([1, 2, 3, 4]) }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not an empty set>baz</if>')
  assert.deepEqual(template({ foo: new Set([1, 2, 3, 4]) }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an empty map>baz</if>')
  assert.deepEqual(template({ foo: new Map([]) }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an empty map>baz</if>')
  assert.deepEqual(template({ foo: new Map([ [{}, 'bar'] ]) }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not an empty map>baz</if>')
  assert.deepEqual(template({ foo: new Map([ [{}, 'bar'] ]) }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an array>baz</if>')
  assert.deepEqual(template({ foo: [] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an array>baz</if>')
  assert.deepEqual(template({ foo: '' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an array>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not an array>baz</if>')
  assert.deepEqual(template({ foo: [] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not an array>baz</if>')
  assert.deepEqual(template({ foo: '' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not an array>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a string>baz</if>')
  assert.deepEqual(template({ foo: '' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a string>baz</if>')
  assert.deepEqual(template({ foo: 'foo' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a string>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a string>baz</if>')
  assert.deepEqual(template({ foo: '' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a string>baz</if>')
  assert.deepEqual(template({ foo: 'foo' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a string>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a multiple of bar>baz</if>')
  assert.deepEqual(template({ foo: 100, bar: 10 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a multiple of bar>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 11 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a multiple of bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 9 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a multiple of bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 9 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a symbol>baz</if>')
  assert.deepEqual(template({ foo: Symbol('foo') }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a symbol>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a symbol>baz</if>')
  assert.deepEqual(template({ foo: Symbol('foo') }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a symbol>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a map>baz</if>')
  assert.deepEqual(template({ foo: new Map() }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a map>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a map>baz</if>')
  assert.deepEqual(template({ foo: [] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a map>baz</if>')
  assert.deepEqual(template({ foo: new Map() }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a map>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a map>baz</if>')
  assert.deepEqual(template({ foo: [] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a weakmap>baz</if>')
  assert.deepEqual(template({ foo: new WeakMap() }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a weakmap>baz</if>')
  assert.deepEqual(template({ foo: new WeakMap([ [{}, 'foo'], [{}, 'bar'] ]) }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a weakmap>baz</if>')
  assert.deepEqual(template({ foo: new Map() }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a weakmap>baz</if>')
  assert.deepEqual(template({ foo: new WeakMap() }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a weakmap>baz</if>')
  assert.deepEqual(template({ foo: new WeakMap([ [{}, 'foo'], [{}, 'bar'] ]) }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a weakmap>baz</if>')
  assert.deepEqual(template({ foo: new Map() }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a set>baz</if>')
  assert.deepEqual(template({ foo: new Set() }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a set>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a set>baz</if>')
  assert.deepEqual(template({ foo: [] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a set>baz</if>')
  assert.deepEqual(template({ foo: new Set() }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a set>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a set>baz</if>')
  assert.deepEqual(template({ foo: [] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a weakset>baz</if>')
  assert.deepEqual(template({ foo: new WeakSet() }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a weakset>baz</if>')
  assert.deepEqual(template({ foo: new WeakSet([ {} ]) }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a weakset>baz</if>')
  assert.deepEqual(template({ foo: new Set() }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a weakset>baz</if>')
  assert.deepEqual(template({ foo: new Set() }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a boolean>baz</if>')
  assert.deepEqual(template({ foo: true }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a boolean>baz</if>')
  assert.deepEqual(template({ foo: false }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a boolean>baz</if>')
  assert.deepEqual(template({ foo: true }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a boolean>baz</if>')
  assert.deepEqual(template({ foo: '' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is undefined>baz</if>')
  assert.deepEqual(template({ foo: undefined }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is undefined>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not undefined>baz</if>')
  assert.deepEqual(template({ foo: undefined }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not undefined>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is null>baz</if>')
  assert.deepEqual(template({ foo: null }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not null>baz</if>')
  assert.deepEqual(template({ foo: null }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is void>baz</if>')
  assert.deepEqual(template({ foo: undefined }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is void>baz</if>')
  assert.deepEqual(template({ foo: void 0 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is null>baz</if>')
  assert.deepEqual(template({ foo: void 0 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not void>baz</if>')
  assert.deepEqual(template({ foo: undefined }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not void>baz</if>')
  assert.deepEqual(template({ foo: void 0 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not null>baz</if>')
  assert.deepEqual(template({ foo: void 0 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an object>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an object>baz</if>')
  assert.deepEqual(template({ foo: null }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an object>baz</if>')
  assert.deepEqual(template({ foo: function () {} }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not an object>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not an object>baz</if>')
  assert.deepEqual(template({ foo: null }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not an object>baz</if>')
  assert.deepEqual(template({ foo: function () {} }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a regexp>baz</if>')
  assert.deepEqual(template({ foo: /regexp/ }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a regexp>baz</if>')
  assert.deepEqual(template({ foo: new RegExp('regexp') }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a regexp>baz</if>')
  assert.deepEqual(template({ foo: '' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a regexp>baz</if>')
  assert.deepEqual(template({ foo: /regexp/ }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a regexp>baz</if>')
  assert.deepEqual(template({ foo: new RegExp('regexp') }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a regexp>baz</if>')
  assert.deepEqual(template({ foo: '' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a regex>baz</if>')
  assert.deepEqual(template({ foo: /regexp/ }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a regex>baz</if>')
  assert.deepEqual(template({ foo: new RegExp('regexp') }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a regex>baz</if>')
  assert.deepEqual(template({ foo: '' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a regex>baz</if>')
  assert.deepEqual(template({ foo: /regexp/ }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a regex>baz</if>')
  assert.deepEqual(template({ foo: new RegExp('regexp') }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a regex>baz</if>')
  assert.deepEqual(template({ foo: '' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a date>baz</if>')
  assert.deepEqual(template({ foo: new Date() }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a date>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 15, 4) }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a date>baz</if>')
  assert.deepEqual(template({ foo: '08.09.2018' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a date>baz</if>')
  assert.deepEqual(template({ foo: new Date() }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a date>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 15, 4) }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a date>baz</if>')
  assert.deepEqual(template({ foo: '08.09.2018' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is even>baz</if>')
  assert.deepEqual(template({ foo: 2 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is even>baz</if>')
  assert.deepEqual(template({ foo: 0 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is even>baz</if>')
  assert.deepEqual(template({ foo: 1 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is even>baz</if>')
  assert.deepEqual(template({ foo: 'baz' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is even>baz</if>')
  assert.deepEqual(template({ foo: [1, 2] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is even>baz</if>')
  assert.deepEqual(template({ foo: [1, 2].length }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not even>baz</if>')
  assert.deepEqual(template({ foo: 2 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not even>baz</if>')
  assert.deepEqual(template({ foo: 0 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not even>baz</if>')
  assert.deepEqual(template({ foo: 1 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not even>baz</if>')
  assert.deepEqual(template({ foo: 'baz' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not even>baz</if>')
  assert.deepEqual(template({ foo: [1, 2] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not even>baz</if>')
  assert.deepEqual(template({ foo: [1, 2].length }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is odd>baz</if>')
  assert.deepEqual(template({ foo: 1 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is odd>baz</if>')
  assert.deepEqual(template({ foo: 2 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is odd>baz</if>')
  assert.deepEqual(template({ foo: [1].length }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not odd>baz</if>')
  assert.deepEqual(template({ foo: 1 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not odd>baz</if>')
  assert.deepEqual(template({ foo: 2 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not odd>baz</if>')
  assert.deepEqual(template({ foo: [1].length }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo bitwise or bar>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 0 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo bitwise or bar>baz</if>')
  assert.deepEqual(template({ foo: 1, bar: 1 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo bitwise or bar>baz</if>')
  assert.deepEqual(template({ foo: 1, bar: 0 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo bitwise or bar>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 1 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo bitwise and bar>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 0 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo bitwise and bar>baz</if>')
  assert.deepEqual(template({ foo: 1, bar: 1 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo bitwise and bar>baz</if>')
  assert.deepEqual(template({ foo: 1, bar: 0 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo bitwise and bar>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 1 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo bitwise and bar>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 0 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo bitwise and bar>baz</if>')
  assert.deepEqual(template({ foo: 1, bar: 1 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo bitwise and bar>baz</if>')
  assert.deepEqual(template({ foo: 1, bar: 0 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo bitwise and bar>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 1 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo bitwise xor bar>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 0 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo bitwise xor bar>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 1 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo bitwise xor bar>baz</if>')
  assert.deepEqual(template({ foo: 1, bar: 0 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo bitwise xor bar>baz</if>')
  assert.deepEqual(template({ foo: 1, bar: 1 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if not foo>baz</if>')
  assert.deepEqual(template({ foo: null }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if not foo>baz</if>')
  assert.deepEqual(template({ foo: undefined }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if not foo>baz</if>')
  assert.deepEqual(template({ foo: false }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if not foo>baz</if>')
  assert.deepEqual(template({}, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if not foo>baz</if>')
  assert.deepEqual(template({ foo: true }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if not foo>baz</if>')
  assert.deepEqual(template({ foo: { bar: {} } }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a video>baz</if>')
  assert.deepEqual(template({ foo: 'foo.flv' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a video>baz</if>')
  assert.deepEqual(template({ foo: 'foo.mp3' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a video>baz</if>')
  assert.deepEqual(template({ foo: 'fooflv' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a video>baz</if>')
  assert.deepEqual(template({ foo: 'fooflv' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an image>baz</if>')
  assert.deepEqual(template({ foo: 'foo.png' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an image>baz</if>')
  assert.deepEqual(template({ foo: 'foo.svg' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an image>baz</if>')
  assert.deepEqual(template({ foo: 'foobmp' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not an image>baz</if>')
  assert.deepEqual(template({ foo: 'foo.bmp' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an audio>baz</if>')
  assert.deepEqual(template({ foo: 'foo.flac' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an audio>baz</if>')
  assert.deepEqual(template({ foo: 'foo.ogg' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an audio>baz</if>')
  assert.deepEqual(template({ foo: 'foomp3' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not an audio>baz</if>')
  assert.deepEqual(template({ foo: 'foomp3' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has an extension of bar>baz</if>')
  assert.deepEqual(template({ foo: 'foo.mp3', bar: 'mp3' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has extension of={"jpg"}>baz</if>')
  assert.deepEqual(template({ foo: 'foo.jpg' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has an extension of bar>baz</if>')
  assert.deepEqual(template({ foo: 'foo.mp3', bar: '.ogg' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo does not have an extension of bar>baz</if>')
  assert.deepEqual(template({ foo: 'foo.mp3', bar: '.ogg' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has a whitespace>baz</if>')
  assert.deepEqual(template({ foo: 'foo&nbsp;bar' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has a whitespace>baz</if>')
  assert.deepEqual(template({ foo: 'foobar' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has a whitespace>baz</if>')
  assert.deepEqual(template({ foo: '\n' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has a whitespace>baz</if>')
  assert.deepEqual(template({ foo: '&nbsp;' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo does not have a whitespace>baz</if>')
  assert.deepEqual(template({ foo: 'foobar' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo does not have a whitespace>baz</if>')
  assert.deepEqual(template({ foo: 'foo bar' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has a newline>baz</if>')
  assert.deepEqual(template({ foo: 'foo\nbar' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has a newline>baz</if>')
  assert.deepEqual(template({ foo: 'foo\tbar' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo does not have a newline>baz</if>')
  assert.deepEqual(template({ foo: 'foo\nbar' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo does not have a newline>baz</if>')
  assert.deepEqual(template({ foo: 'foo\tbar' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has a number>baz</if>')
  assert.deepEqual(template({ foo: { bar: 4 } }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has a number>baz</if>')
  assert.deepEqual(template({ foo: 'bar' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has a number>baz</if>')
  assert.deepEqual(template({ foo: [1, 2] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has a number>baz</if>')
  assert.deepEqual(template({ foo: [{}, 'bar', 'baz'] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has a number>baz</if>')
  assert.deepEqual(template({ foo: [{}, 4, 'baz'] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has a number>baz</if>')
  assert.deepEqual(template({ foo: 4 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is true>baz</if>')
  assert.deepEqual(template({ foo: true }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is true>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is true>baz</if>')
  assert.deepEqual(template({ foo: [] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is true>baz</if>')
  assert.deepEqual(template({ foo: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is true>baz</if>')
  assert.deepEqual(template({ foo: 0 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is true>baz</if>')
  assert.deepEqual(template({ foo: null }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is true>baz</if>')
  assert.deepEqual(template({ foo: undefined }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is true>baz</if>')
  assert.deepEqual(template({ foo: '' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is true>baz</if>')
  assert.deepEqual(template({ foo: NaN }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not true>baz</if>')
  assert.deepEqual(template({ foo: false }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not true>baz</if>')
  assert.deepEqual(template({ foo: 'bar' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is truthy>baz</if>')
  assert.deepEqual(template({ foo: true }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is truthy>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is truthy>baz</if>')
  assert.deepEqual(template({ foo: [] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is truthy>baz</if>')
  assert.deepEqual(template({ foo: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is truthy>baz</if>')
  assert.deepEqual(template({ foo: 0 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is truthy>baz</if>')
  assert.deepEqual(template({ foo: null }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is truthy>baz</if>')
  assert.deepEqual(template({ foo: undefined }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is truthy>baz</if>')
  assert.deepEqual(template({ foo: '' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is truthy>baz</if>')
  assert.deepEqual(template({ foo: NaN }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not truthy>baz</if>')
  assert.deepEqual(template({ foo: false }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not truthy>baz</if>')
  assert.deepEqual(template({ foo: 'bar' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is false>baz</if>')
  assert.deepEqual(template({ foo: false }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is false>baz</if>')
  assert.deepEqual(template({ foo: 0 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is false>baz</if>')
  assert.deepEqual(template({ foo: null }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is false>baz</if>')
  assert.deepEqual(template({ foo: undefined }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is false>baz</if>')
  assert.deepEqual(template({ foo: '' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is false>baz</if>')
  assert.deepEqual(template({ foo: NaN }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is false>baz</if>')
  assert.deepEqual(template({ foo: true }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is false>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is false>baz</if>')
  assert.deepEqual(template({ foo: [] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not false>baz</if>')
  assert.deepEqual(template({ foo: true }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not false>baz</if>')
  assert.deepEqual(template({ foo: 'bar' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is falsy>baz</if>')
  assert.deepEqual(template({ foo: false }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is falsy>baz</if>')
  assert.deepEqual(template({ foo: 0 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is falsy>baz</if>')
  assert.deepEqual(template({ foo: null }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is falsy>baz</if>')
  assert.deepEqual(template({ foo: undefined }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is falsy>baz</if>')
  assert.deepEqual(template({ foo: '' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is falsy>baz</if>')
  assert.deepEqual(template({ foo: NaN }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is falsy>baz</if>')
  assert.deepEqual(template({ foo: true }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is falsy>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is falsy>baz</if>')
  assert.deepEqual(template({ foo: [] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not falsy>baz</if>')
  assert.deepEqual(template({ foo: true }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not falsy>baz</if>')
  assert.deepEqual(template({ foo: 'bar' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is divisible by bar>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 5 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not divisible by bar>baz</if>')
  assert.deepEqual(template({ foo: 5, bar: 10 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is divisible by="{10}">baz</if>')
  assert.deepEqual(template({ foo: 10 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not divisible by="{10}">baz</if>')
  assert.deepEqual(template({ foo: 5 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is divisible by={bar}>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 5 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not divisible by={bar}>baz</if>')
  assert.deepEqual(template({ foo: 5, bar: 10 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is divisible by five>baz</if>')
  assert.deepEqual(template({ foo: 10 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is divisible by five>baz</if>')
  assert.deepEqual(template({ foo: 6 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not divisible by five>baz</if>')
  assert.deepEqual(template({ foo: 6 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is prime>baz</if>')
  assert.deepEqual(template({ foo: 3 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is prime>baz</if>')
  assert.deepEqual(template({ foo: 5 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is prime>baz</if>')
  assert.deepEqual(template({ foo: 1 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not prime>baz</if>')
  assert.deepEqual(template({ foo: 1 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a palindrome>baz</if>')
  assert.deepEqual(template({ foo: 'madam' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a palindrome>baz</if>')
  assert.deepEqual(template({ foo: 'foo' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a palindrome>baz</if>')
  assert.deepEqual(template({ foo: 'foo' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is sooner than bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 4, 1), bar: new Date(2018, 4, 29) }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is sooner than bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 4, 29), bar: new Date(2018, 4, 11) }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not sooner than bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 4, 29), bar: new Date(2018, 4, 11) }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is later than bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 4, 29), bar: new Date(2018, 4, 11) }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is later than bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 4, 1), bar: new Date(2018, 4, 29) }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not later than bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 4, 1), bar: new Date(2018, 4, 29) }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is before bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 5, 27), bar: new Date(2018, 5, 29) }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is before bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 5, 29), bar: new Date(2018, 5, 27) }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not before bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 5, 29), bar: new Date(2018, 5, 27) }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is after bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 5, 29), bar: new Date(2018, 5, 27) }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is after bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 5, 27), bar: new Date(2018, 5, 29) }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not after bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 5, 27), bar: new Date(2018, 5, 29) }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a digit>baz</if>')
  assert.deepEqual(template({ foo: 0 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a digit>baz</if>')
  assert.deepEqual(template({ foo: 7 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a digit>baz</if>')
  assert.deepEqual(template({ foo: 10 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a digit>baz</if>')
  assert.deepEqual(template({ foo: 10 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is decimal>baz</if>')
  assert.deepEqual(template({ foo: 2.91 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is decimal>baz</if>')
  assert.deepEqual(template({ foo: 2.11 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is decimal>baz</if>')
  assert.deepEqual(template({ foo: 2.00 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is decimal>baz</if>')
  assert.deepEqual(template({ foo: 1 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not decimal>baz</if>')
  assert.deepEqual(template({ foo: 1 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is frozen>baz</if>')
  assert.deepEqual(template({ foo: Object.freeze({}) }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is frozen>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not frozen>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is sealed>baz</if>')
  assert.deepEqual(template({ foo: Object.seal({}) }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is sealed>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not sealed>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo eq="bar">baz</if>')
  assert.deepEqual(template({ foo: 'bar' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo eq="bar">baz</if>')
  assert.deepEqual(template({ foo: 'baz' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo eq="{bar}">baz</if>')
  assert.deepEqual(template({ foo: 'qux', bar: 'qux' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo eq="{bar}">baz</if>')
  assert.deepEqual(template({ foo: 'qux', bar: 'quuux' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo eq="{bar}">baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 10 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo eq="{bar}">baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 0 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo eq="{bar}">baz</if>')
  assert.deepEqual(template({ foo: null, bar: null }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo eq="{bar}">baz</if>')
  assert.deepEqual(template({ foo: {}, bar: {} }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo eq="{10}">baz</if>')
  assert.deepEqual(template({ foo: 10 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo eq="{100 + 100}">baz</if>')
  assert.deepEqual(template({ foo: 200 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo eq="{100 + 100 + 0}">baz</if>')
  assert.deepEqual(template({ foo: 200 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo eq="{bar}">baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 10 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo eq="{bar}">baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 100 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo starts with bar>baz</if>')
  assert.deepEqual(template({ foo: 'ban qux', bar: 'ban' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo starts with bar>baz</if>')
  assert.deepEqual(template({ foo: 'ban qux', bar: 'qux' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo does not start with bar>baz</if>')
  assert.deepEqual(template({ foo: 'ban qux', bar: 'qux' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo ends with bar>baz</if>')
  assert.deepEqual(template({ foo: 'ban qux', bar: 'qux' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo ends with bar>baz</if>')
  assert.deepEqual(template({ foo: 'ban qux', bar: 'ban' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo does not end with bar>baz</if>')
  assert.deepEqual(template({ foo: 'ban qux', bar: 'ban' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo and bar and baz>qux</if>')
  assert.deepEqual(template({ foo: true, bar: true, baz: true }, escape), 'qux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo and bar and baz>qux</if>')
  assert.deepEqual(template({ foo: false, bar: true, baz: true }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo and bar and baz>qux</if>')
  assert.deepEqual(template({ foo: true, bar: true, baz: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo and bar and baz>qux</if>')
  assert.deepEqual(template({ foo: false, bar: true, baz: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo and bar and baz and ban>qux</if>')
  assert.deepEqual(template({ foo: true, bar: true, baz: true, ban: true }, escape), 'qux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo and bar and baz and ban>qux</if>')
  assert.deepEqual(template({ foo: false, bar: true, baz: true, ban: true }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo and bar and baz and ban>qux</if>')
  assert.deepEqual(template({ foo: false, bar: false, baz: false, ban: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo and bar and baz and ban>qux</if>')
  assert.deepEqual(template({ foo: true, bar: true, baz: true, ban: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo and bar equals baz>qux</if>')
  assert.deepEqual(template({ foo: true, bar: 'baz', baz: 'baz' }, escape), 'qux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo and bar equals baz>qux</if>')
  assert.deepEqual(template({ foo: false, bar: 'baz', baz: 'baz' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo and bar equals baz>qux</if>')
  assert.deepEqual(template({ foo: true, bar: 'baz', baz: 'ban' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo and bar equals="baz">qux</if>')
  assert.deepEqual(template({ foo: true, bar: 'baz' }, escape), 'qux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo and bar equals="{baz}">qux</if>')
  assert.deepEqual(template({ foo: true, bar: 'baz', baz: 'baz' }, escape), 'qux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is divisible by three and foo is divisible by five>bar</if>')
  assert.deepEqual(template({ foo: 15 }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is divisible by three and foo is divisible by five>bar</if>')
  assert.deepEqual(template({ foo: 14 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is divisible by three and foo is divisible by four>bar</if>')
  assert.deepEqual(template({ foo: 12 }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is divisible by two and foo is divisible by five>bar</if>')
  assert.deepEqual(template({ foo: 10 }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is divisible by three and foo is divisible by five>bar</if>')
  assert.deepEqual(template({ foo: 8 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo includes bar>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum', bar: 'ipsum' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo includes bar>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum', bar: 'dolor' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo includes bar>baz</if>')
  assert.deepEqual(template({ foo: ['lorem', 'ipsum'], bar: 'ipsum' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo includes bar>baz</if>')
  assert.deepEqual(template({ foo: ['lorem', 'ipsum'], bar: 'dolor' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo does not include={"dolor"}>baz</if>')
  assert.deepEqual(template({ foo: ['lorem', 'ipsum'] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo contains={"ipsum"}>baz</if>')
  assert.deepEqual(template({ foo: ['lorem', 'ipsum'] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo contains={"dolor"}>baz</if>')
  assert.deepEqual(template({ foo: ['lorem', 'ipsum'] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo does not contain={"dolor"}>baz</if>')
  assert.deepEqual(template({ foo: ['lorem', 'ipsum'] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo contains={"ipsum"}>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo contains={"dolor"}>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo matches bar>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum', bar: /ipsum/ }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo matches bar>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum', bar: /dolor/ }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo does not match bar>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum', bar: /dolor/ }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if not foo and bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: true }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if not foo and bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if not foo and bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if not foo and bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: true }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is positive and bar>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: true }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is positive and bar>baz</if>')
  assert.deepEqual(template({ foo: -10, bar: true }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is positive and bar>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is positive and bar>baz</if>')
  assert.deepEqual(template({ foo: -10, bar: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not positive and bar>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: true }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not positive and bar>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: true }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not positive and bar>baz</if>')
  assert.deepEqual(template({ foo: -10, bar: true }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not positive and bar>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not positive and bar>baz</if>')
  assert.deepEqual(template({ foo: -10, bar: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not positive and not bar>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: true }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not positive and not bar>baz</if>')
  assert.deepEqual(template({ foo: -10, bar: true }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not positive and not bar>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not positive and not bar>baz</if>')
  assert.deepEqual(template({ foo: -10, bar: false }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo and not bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: true }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo and not bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: false }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo and not bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo and not bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: true }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo responds to={"bar"}>baz</if>')
  assert.deepEqual(template({ foo: { bar () {} } }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo responds to bar>baz</if>')
  assert.deepEqual(template({ foo: { bar () {} }, bar: 'bar' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo responds to bar>baz</if>')
  assert.deepEqual(template({ foo: { bar: [] }, bar: 'bar' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo does not respond to bar>baz</if>')
  assert.deepEqual(template({ foo: { bar: [] }, bar: 'bar' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo bitwise and bar or baz>baz</if>')
  assert.deepEqual(template({ foo: 1, bar: 1, baz: 0 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo bitwise and bar or baz>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 0, baz: 0 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an email>baz</if>')
  assert.deepEqual(template({ foo: 'as@ts.eu' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an email>baz</if>')
  assert.deepEqual(template({ foo: 'asts.eu' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo have more than one element>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo have more than four item>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos have more than two photo>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos do not have more than two photo>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo have less than six element>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos have less than two photo>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos do not have less than two photo>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos have two photo>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos have zero photo>baz</if>')
  assert.deepEqual(template({ photos: [] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos have one photo>baz</if>')
  assert.deepEqual(template({ photos: [] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos do not have one photo>baz</if>')
  assert.deepEqual(template({ photos: [] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos have many pictures>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos have many pictures>baz</if>')
  assert.deepEqual(template({ photos: [{}] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos have many pictures>baz</if>')
  assert.deepEqual(template({ photos: [{}] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos do not have many pictures>baz</if>')
  assert.deepEqual(template({ photos: [{}] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos have elements>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos have elements>baz</if>')
  assert.deepEqual(template({ photos: [{}] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos have elements>baz</if>')
  assert.deepEqual(template({ photos: [] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos do not have elements>baz</if>')
  assert.deepEqual(template({ photos: [] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has more than one element>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has more than four item>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has more than four item>baz</if>')
  assert.deepEqual(template({ foo: [{}, {}] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos has more than two picture>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos does not have more than two picture>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has less than six element>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos has less than two item>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos does not have less than two item>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos has two element>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos has zero item>baz</if>')
  assert.deepEqual(template({ photos: [] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos has one picture>baz</if>')
  assert.deepEqual(template({ photos: [] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos does not have one element>baz</if>')
  assert.deepEqual(template({ photos: [] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos has many pictures>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos has many pictures>baz</if>')
  assert.deepEqual(template({ photos: [{}] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if photos does not have many pictures>baz</if>')
  assert.deepEqual(template({ photos: [{}] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has items>baz</if>')
  assert.deepEqual(template({ foo: [{}, {}] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has items>baz</if>')
  assert.deepEqual(template({ foo: [{}] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has items>baz</if>')
  assert.deepEqual(template({ foo: [] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo does not have items>baz</if>')
  assert.deepEqual(template({ foo: [] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is between bar and baz>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 10, baz: 20 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is between bar and baz>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 10, baz: 20 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is between bar and baz>baz</if>')
  assert.deepEqual(template({ foo: 15, bar: 10, baz: 20 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is between bar and baz>baz</if>')
  assert.deepEqual(template({ foo: 20, bar: 10, baz: 20 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is between bar and baz>baz</if>')
  assert.deepEqual(template({ foo: 50, bar: 10, baz: 20 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is between bar and baz>baz</if>')
  assert.deepEqual(template({ foo: 50, bar: 10, baz: 20 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is between one and ten>baz</if>')
  assert.deepEqual(template({ foo: 10 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is between six and nine>baz</if>')
  assert.deepEqual(template({ foo: 5 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not between six and nine>baz</if>')
  assert.deepEqual(template({ foo: 5 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is between bar and baz and qux>baz</if>')
  assert.deepEqual(template({ foo: 15, bar: 10, baz: 20, qux: true }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is between bar and baz and qux>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 10, baz: 20, qux: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not between bar and baz and qux>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 10, baz: 20, qux: true }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is below bar>baz</if>')
  assert.deepEqual(template({ foo: 5, bar: 10 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is below bar>baz</if>')
  assert.deepEqual(template({ foo: 20, bar: 20 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is below six>baz</if>')
  assert.deepEqual(template({ foo: 5 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is below three>baz</if>')
  assert.deepEqual(template({ foo: 5 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not below three>baz</if>')
  assert.deepEqual(template({ foo: 5 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not below three>baz</if>')
  assert.deepEqual(template({ foo: 5 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is above bar>baz</if>')
  assert.deepEqual(template({ foo: 15, bar: 10 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is above bar>baz</if>')
  assert.deepEqual(template({ foo: 20, bar: 20 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is above six>baz</if>')
  assert.deepEqual(template({ foo: 15 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is above nine>baz</if>')
  assert.deepEqual(template({ foo: 5 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not above nine>baz</if>')
  assert.deepEqual(template({ foo: 5 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not above three>baz</if>')
  assert.deepEqual(template({ foo: 5 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is at least bar>baz</if>')
  assert.deepEqual(template({ foo: 20, bar: 20 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is at least four>baz</if>')
  assert.deepEqual(template({ foo: 5 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is at least bar>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 20 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is at least eight>baz</if>')
  assert.deepEqual(template({ foo: 5 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not at least bar>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 20 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not at least eight>baz</if>')
  assert.deepEqual(template({ foo: 5 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is at most bar>baz</if>')
  assert.deepEqual(template({ foo: 20, bar: 20 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is at most bar>baz</if>')
  assert.deepEqual(template({ foo: 30, bar: 20 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not at most bar>baz</if>')
  assert.deepEqual(template({ foo: 30, bar: 20 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is at most eight>baz</if>')
  assert.deepEqual(template({ foo: 6 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is at most eight>baz</if>')
  assert.deepEqual(template({ foo: 20 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not at most eight>baz</if>')
  assert.deepEqual(template({ foo: 10 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has length of bar>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 5 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has length of bar>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 10 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo does not have length of bar>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 10 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has length of five>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 10 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has length of six>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 10 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has length of at least bar>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 5 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has length of at least bar>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 10 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo does not have length of at least bar>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 10 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has length of at least five>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum', bar: 5 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has length of at least bar>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum', bar: 100 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has length of at most bar>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 5 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has length of at most bar>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 1 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo does not have length of at most bar>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 1 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has length of at most five>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum', bar: 5 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo does not have length of at most bar>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum', bar: 5 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is different than bar>baz</if>')
  assert.deepEqual(template({ foo: 5, bar: 1 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is different than bar>baz</if>')
  assert.deepEqual(template({ foo: 'lorem', bar: 'ipsum' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is different than bar>baz</if>')
  assert.deepEqual(template({ foo: 5, bar: 5 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is different than bar>baz</if>')
  assert.deepEqual(template({ foo: 'lorem', bar: 'lorem' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is in bar>baz</if>')
  assert.deepEqual(template({ foo: 5, bar: [1, 2, 3, 4] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is in bar>baz</if>')
  assert.deepEqual(template({ foo: 4, bar: [1, 2, 3, 4] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is in bar>baz</if>')
  assert.deepEqual(template({ foo: '5', bar: '1234' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is in bar>baz</if>')
  assert.deepEqual(template({ foo: '4', bar: '1234' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a url><a href="{foo}">{bar}</a></if>')
  assert.deepEqual(template({ foo: 'https://buxlabs.pl/narzędzia/js', bar: 'click me' }, escape), '<a href="https://buxlabs.pl/narzędzia/js">click me</a>')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a url><a href="{foo}">{bar}</a></if>')
  assert.deepEqual(template({ foo: '' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><else>baz<if qux>quux</if></else>')
  assert.deepEqual(template({ foo: false, qux: false }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><else>baz<if qux>quux</if></else>')
  assert.deepEqual(template({ foo: true, qux: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><else>baz<if qux>quux</if></else>')
  assert.deepEqual(template({ foo: false, qux: true }, escape), 'bazquux')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif bar>baz<if qux>quux</if></elseif>')
  assert.deepEqual(template({ foo: true, bar: true, qux: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif bar>baz<if qux>quux</if></elseif>')
  assert.deepEqual(template({ foo: false, bar: false, qux: false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><else>baz<if qux>quux</if></else>')
  assert.deepEqual(template({ foo: true, bar: false, qux: false }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif bar>baz<if qux>quux</if></elseif>')
  assert.deepEqual(template({ foo: false, bar: true, qux: false }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif bar>baz<if qux>quux</if></elseif>')
  assert.deepEqual(template({ foo: false, bar: false, qux: true }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif bar>baz<if qux>quux</if></elseif>')
  assert.deepEqual(template({ foo: true, bar: true, qux: false }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif bar>baz<if qux>quux</if></elseif>')
  assert.deepEqual(template({ foo: true, bar: false, qux: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>foo</if><elseif bar>bar</elseif><else><if baz>baz</if><else>ban</else></else>')
  assert.deepEqual(template({ foo: true, bar: true, baz: true }, escape), 'foo')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>foo</if><elseif bar>bar</elseif><else><if baz>baz</if><else>ban</else></else>')
  assert.deepEqual(template({ foo: false, bar: false, baz: true }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>foo</if><elseif bar>bar</elseif><else><if baz>baz</if><else>ban</else></else>')
  assert.deepEqual(template({ foo: false, bar: false, baz: false }, escape), 'ban')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>foo</if><elseif bar>bar</elseif><else><if baz>baz</if><else>ban</else></else>')
  assert.deepEqual(template({ foo: false, bar: true, baz: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>foo</if><elseif bar>bar</elseif><else><if baz>baz</if><else>ban</else></else>')
  assert.deepEqual(template({ foo: false, bar: false, baz: true }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>foo</if><elseif bar>bar</elseif><else><if baz>baz</if><else>ban</else></else>')
  assert.deepEqual(template({ foo: true, bar: false, baz: true }, escape), 'foo')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseunless bar>baz</elseunless>')
  assert.deepEqual(template({ foo: false, bar: false }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><else>baz</else>')
  assert.deepEqual(template({ foo: true }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><else>baz</else>')
  assert.deepEqual(template({ foo: false }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif bar>baz</else>')
  assert.deepEqual(template({ foo: true, bar: false }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo>bar</if><elseif bar>baz</else>')
  assert.deepEqual(template({ foo: false, bar: true }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is extensible>bar</if>')
  assert.deepEqual(template({ foo: {} }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not extensible>bar</if>')
  assert.deepEqual(template({ foo: {} }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not extensible>bar</if>')
  assert.deepEqual(template({ foo: Object.seal({}) }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an error>bar</if>')
  assert.deepEqual(template({ foo: new Error('ValidationError') }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not an error>bar</if>')
  assert.deepEqual(template({ foo: {} }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has any keys>bar</if>')
  assert.deepEqual(template({ foo: { baz: 'baz' } }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has any keys>bar</if>')
  assert.deepEqual(template({ foo: ['baz'] }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has any keys>bar</if>')
  assert.deepEqual(template({ foo: {} }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has any keys>bar</if>')
  assert.deepEqual(template({ foo: [] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo does not have any keys>bar</if>')
  assert.deepEqual(template({ foo: {} }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is nan>bar</if>')
  assert.deepEqual(template({ foo: NaN }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not nan>bar</if>')
  assert.deepEqual(template({ foo: null }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo exists>bar</if>')
  assert.deepEqual(template({ foo: {} }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo exists>bar</if>')
  assert.deepEqual(template({ foo: undefined }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo not exist>bar</if>')
  assert.deepEqual(template({ foo: undefined }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is missing>bar</if>')
  assert.deepEqual(template({ foo: {} }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is missing>bar</if>')
  assert.deepEqual(template({ foo: undefined }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not missing>bar</if>')
  assert.deepEqual(template({ foo: null }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is function>bar</if>')
  assert.deepEqual(template({ foo: () => {} }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is function>bar</if>')
  assert.deepEqual(template({ foo: function () {} }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is function>bar</if>')
  assert.deepEqual(template({ foo: {} }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has type of bar>bar</if>')
  assert.deepEqual(template({ foo: {}, bar: 'object' }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo has type of bar>bar</if>')
  assert.deepEqual(template({ foo: {}, bar: 'string' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo does not have type of bar>bar</if>')
  assert.deepEqual(template({ foo: {}, bar: 'string' }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is type of bar>bar</if>')
  assert.deepEqual(template({ foo: {}, bar: 'object' }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is type of bar>bar</if>')
  assert.deepEqual(template({ foo: {}, bar: 'string' }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not type of bar>bar</if>')
  assert.deepEqual(template({ foo: {}, bar: 'string' }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an instance of bar>bar</if>')
  assert.deepEqual(template({ foo: new Date(), bar: Date }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is an instance of bar>bar</if>')
  assert.deepEqual(template({ foo: {}, bar: Date }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not an instance of bar>bar</if>')
  assert.deepEqual(template({ foo: {}, bar: Date }, escape), 'bar')
  assert.deepEqual(warnings, [])
})

test('if: call expressions', async assert => {
  var { template, warnings } = await compile('<if foo()>bar</if>')
  assert.deepEqual(template({ foo: () => false }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo()>bar</if>')
  assert.deepEqual(template({ foo: () => true }, escape), 'bar')
  assert.deepEqual(warnings, [])
})

test('if: negated call expressions', async assert => {
  var { template, warnings, errors } = await compile('<if !foo()>bar</if>')
  assert.deepEqual(template({ foo: () => false }, escape), 'bar')
  assert.deepEqual(warnings, [])
  assert.deepEqual(errors, [])

  var { template, warnings, errors } = await compile('<if !foo()>bar</if>')
  assert.deepEqual(template({ foo: () => true }, escape), '')
  assert.deepEqual(warnings, [])
  assert.deepEqual(errors, [])

  var { template, warnings, errors } = await compile('<if !!foo()>bar</if>')
  assert.deepEqual(template({ foo: () => false }, escape), '')
  assert.deepEqual(warnings, [])
  assert.deepEqual(errors, [])

  var { template, warnings, errors } = await compile('<if !!foo()>bar</if>')
  assert.deepEqual(template({ foo: () => true }, escape), 'bar')
  assert.deepEqual(warnings, [])
  assert.deepEqual(errors, [])

  var { template, warnings, errors } = await compile('<if !!!foo()>bar</if>')
  assert.deepEqual(template({ foo: () => false }, escape), 'bar')
  assert.deepEqual(warnings, [])
  assert.deepEqual(errors, [])

  var { template, warnings, errors } = await compile('<if !!!foo()>bar</if>')
  assert.deepEqual(template({ foo: () => true }, escape), '')
  assert.deepEqual(warnings, [])
  assert.deepEqual(errors, [])

  var { template, warnings, errors } = await compile('<if !foo.bar()>bar</if>')
  assert.deepEqual(template({ foo: { bar: () => false } }, escape), 'bar')
  assert.deepEqual(warnings, [])
  assert.deepEqual(errors, [])

  var { template, warnings, errors } = await compile('<if !foo.bar()>bar</if>')
  assert.deepEqual(template({ foo: { bar: () => true } }, escape), '')
  assert.deepEqual(warnings, [])
  assert.deepEqual(errors, [])

  var { template, warnings, errors } = await compile('<if !!foo.bar()>bar</if>')
  assert.deepEqual(template({ foo: { bar: () => false } }, escape), '')
  assert.deepEqual(warnings, [])
  assert.deepEqual(errors, [])

  var { template, warnings, errors } = await compile('<if !!foo.bar()>bar</if>')
  assert.deepEqual(template({ foo: { bar: () => true } }, escape), 'bar')
  assert.deepEqual(warnings, [])
  assert.deepEqual(errors, [])

  var { template, warnings, errors } = await compile('<if !!!foo.bar()>bar</if>')
  assert.deepEqual(template({ foo: { bar: () => false } }, escape), 'bar')
  assert.deepEqual(warnings, [])
  assert.deepEqual(errors, [])

  var { template, warnings, errors } = await compile('<if !!!foo.bar()>bar</if>')
  assert.deepEqual(template({ foo: { bar: () => true } }, escape), '')
  assert.deepEqual(warnings, [])
  assert.deepEqual(errors, [])
})

test('if: words to numbers', async assert => {
  var { template, warnings } = await compile('<if number equals zero>foo</if><else>bar</else>')
  assert.deepEqual(template({ number: 0 }, escape), 'foo')
  assert.deepEqual(template({ number: 1 }, escape), 'bar')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if number equals eleven>foo</if><else>bar</else>')
  assert.deepEqual(template({ number: 11 }, escape), 'foo')
  assert.deepEqual(template({ number: 12 }, escape), 'bar')
  assert.deepEqual(warnings, [])
})

test('if: numbers', async assert => {
  var { template, warnings } = await compile('<if photos.length equals 0>foo</if>')
  assert.deepEqual(template({ photos: [] }, escape), 'foo')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if 0 equals 0>foo</if>')
  assert.deepEqual(template({ photos: [] }, escape), 'foo')
  assert.deepEqual(warnings, [])
})

test('if: variables with curly brackets', async assert => {
  var { template, warnings } = await compile('<if {photos.length} equals {0}>foo</if>')
  assert.deepEqual(template({ photos: [] }, escape), 'foo')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo equals {"bar"}>baz</if>')
  assert.deepEqual(template({ foo: 'bar' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if {2+2} equals 4>foo</if>')
  assert.deepEqual(template({}, escape), 'foo')
  assert.deepEqual(warnings, [])
})

test('if: warnings when invalid conditions', async assert => {
  var { template, warnings } = await compile('<if foo if positive>bar</if>')
  assert.deepEqual(template({ foo: true }, escape), 'bar')
  assert.deepEqual(warnings[0].message, 'Invalid action name: foo if positive')
  assert.deepEqual(warnings[0].type, 'INVALID_ACTION')

  var { template, warnings } = await compile('<if foo ist type of bar>bar</if>')
  assert.deepEqual(template({ foo: {}, bar: 'object' }, escape), 'bar')
  assert.deepEqual(warnings[0].message, 'Invalid action name: foo ist type of bar')
  assert.deepEqual(warnings[0].type, 'INVALID_ACTION')

  var { template, warnings } = await compile('<if foo responds bar>baz</if>')
  assert.deepEqual(template({ foo: { bar () {} }, bar: 'bar' }, escape), 'baz')
  assert.deepEqual(warnings[0].message, 'Invalid action name: foo responds bar')
  assert.deepEqual(warnings[0].type, 'INVALID_ACTION')

  var { template, warnings } = await compile('<if foo is nul>baz</if>')
  assert.deepEqual(template({ foo: null, escape }), '')
  assert.deepEqual(warnings[0].message, 'Invalid action name: foo is nul')
  assert.deepEqual(warnings[0].type, 'INVALID_ACTION')
})

test('if: shorthand syntax inside of loops', async assert => {
  const { template } = await compile(`
    <for car in cars>
      <if car.speed gt 0>stop<else>start<end>
    </for>
  `)
  const html = template({
    cars: [
      { speed: 0 },
      { speed: 1 }
    ]
  }, escape)
  assert.deepEqual(html, 'startstop')
})

test('if: shorthand syntax inside of components', async assert => {
  const { template } = await compile(`
    <template foo>
      <if bar>baz<else>qux<end>
    </template>
    <foo bar/>
    <foo>
  `)
  assert.deepEqual(template({}, escape), 'bazqux')
})

test('if: shorthand syntax with translate tag', async assert => {
  const { template } = await compile(`
    <translate foo/>
    <if bar>baz<end>
    <i18n yaml>
    foo:
    - 'fOo'
    - 'foO'
    </i18n>
  `, {
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ bar: true, language: 'pl' }, escape), 'fOobaz')
  assert.deepEqual(template({ bar: true, language: 'en' }, escape), 'foObaz')
  assert.deepEqual(template({ bar: false, language: 'pl' }, escape), 'fOo')
  assert.deepEqual(template({ bar: false, language: 'en' }, escape), 'foO')
})

test('if: true in a curly tag', async assert => {
  const { template } = await compile(`<if {true}>foo<end>`)
  assert.deepEqual(template({}, escape), 'foo')
})

test('if: true without a tag', async assert => {
  const { template } = await compile(`<if true>foo<end>`)
  assert.deepEqual(template({}, escape), 'foo')
})

test('if: false in a curly tag', async assert => {
  const { template } = await compile(`<if {false}>foo<end>`)
  assert.deepEqual(template({}, escape), '')
})

test('if: false without a tag', async assert => {
  const { template } = await compile(`<if false>foo<end>`)
  assert.deepEqual(template({}, escape), '')
})


test('if: true in a curly tag and else tag', async assert => {
  const { template } = await compile(`<if {true}>foo<else>bar<end>`)
  assert.deepEqual(template({}, escape), 'foo')
})

test('if: true without a tag and else tag', async assert => {
  const { template } = await compile(`<if true>foo<else>bar<end>`)
  assert.deepEqual(template({}, escape), 'foo')
})

test('if: false in a curly tag and else tag', async assert => {
  const { template } = await compile(`<if {false}>foo<else>bar<end>`)
  assert.deepEqual(template({}, escape), 'bar')
})

test('if: false without a tag and else tag', async assert => {
  const { template } = await compile(`<if false>foo<else>bar<end>`)
  assert.deepEqual(template({}, escape), 'bar')
})

test('if: is number', async assert => {
  var { template, warnings } = await compile('<if foo is a number>baz</if>')
  assert.deepEqual(template({ foo: [] }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a number>baz</if>')
  assert.deepEqual(template({ foo: 13 }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is a number>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a number>baz</if>')
  assert.deepEqual(template({ foo: [] }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a number>baz</if>')
  assert.deepEqual(template({ foo: 13 }, escape), '')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not a number>baz</if>')
  assert.deepEqual(template({ foo: {} }, escape), 'baz')
  assert.deepEqual(warnings, [])
})

test('if: is numeric', async assert => {
  var { template, warnings } = await compile('<if foo is numeric>baz</if>')
  assert.deepEqual(template({ foo: '0' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is numeric>baz</if>')
  assert.deepEqual(template({ foo: '0xFF' }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not numeric>baz</if>')
  assert.deepEqual(template({ foo: true }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not numeric>baz</if>')
  assert.deepEqual(template({ foo: null }, escape), 'baz')
  assert.deepEqual(warnings, [])

  var { template, warnings } = await compile('<if foo is not numeric>baz</if>')
  assert.deepEqual(template({ foo: undefined }, escape), 'baz')
  assert.deepEqual(warnings, [])
})
