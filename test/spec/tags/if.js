import test from '../../helpers/test'
import compile from '../../helpers/compile'

test('if', async assert => {
  let template

  template = await compile('<if foo>bar</if>')
  assert.deepEqual(template({ foo: false }, html => html), '')

  template = await compile('<if foo>bar</if>')
  assert.deepEqual(template({ foo: true }, html => html), 'bar')

  template = await compile('<if foo>bar</if><if baz>qux</if>')
  assert.deepEqual(template({ foo: true, baz: true }, html => html), 'barqux')

  template = await compile('<if foo>bar</if><if baz>qux</if>')
  assert.deepEqual(template({ foo: true, baz: false }, html => html), 'bar')

  template = await compile('<if foo>bar</if><if baz>qux</if>')
  assert.deepEqual(template({ foo: false, baz: true }, html => html), 'qux')

  template = await compile('<if foo>bar</if><if baz>qux</if>')
  assert.deepEqual(template({ foo: false, baz: false }, html => html), '')

  template = await compile('<if foo.length>bar</if>')
  assert.deepEqual(template({ foo: [] }, html => html), '')

  template = await compile('<if foo.length>bar</if>')
  assert.deepEqual(template({ foo: ['baz'] }, html => html), 'bar')

  template = await compile('<if valid()>bar</if>')
  assert.deepEqual(template({ valid: () => false }, html => html), '')

  template = await compile('<if valid()>bar</if>')
  assert.deepEqual(template({ valid: () => true }, html => html), 'bar')

  template = await compile('<if foo>bar</if><else>baz</else>')
  assert.deepEqual(template({ foo: false }, html => html), 'baz')

  template = await compile('<if foo>bar</if><else>baz</else>')
  assert.deepEqual(template({ foo: true }, html => html), 'bar')

  template = await compile('<if foo>bar</if><elseif baz>qux</elseif>')
  assert.deepEqual(template({ foo: true, baz: false }, html => html), 'bar')

  template = await compile('<if foo>bar</if><elseif baz>qux</elseif>')
  assert.deepEqual(template({ foo: true, baz: true }, html => html), 'bar')

  template = await compile('<if foo>bar</if><elseif baz>qux</elseif>')
  assert.deepEqual(template({ foo: false, baz: false }, html => html), '')

  template = await compile('<if foo>bar</if><elseif baz>qux</elseif>')
  assert.deepEqual(template({ foo: false, baz: true }, html => html), 'qux')

  template = await compile('<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')
  assert.deepEqual(template({ foo: true, baz: true }, html => html), 'bar')

  template = await compile('<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')
  assert.deepEqual(template({ foo: true, baz: false }, html => html), 'bar')

  template = await compile('<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')
  assert.deepEqual(template({ foo: false, baz: false }, html => html), 'quux')

  template = await compile('<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')
  assert.deepEqual(template({ foo: false, baz: true }, html => html), 'qux')

  template = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: true, baz: true, quux: true }, html => html), 'bar')

  template = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: true, baz: false, quux: true }, html => html), 'bar')

  template = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: true, baz: false, quux: false }, html => html), 'bar')

  template = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: false, baz: true, quux: false }, html => html), 'qux')

  template = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: false, baz: true, quux: true }, html => html), 'qux')

  template = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: false, baz: false, quux: true }, html => html), 'corge')

  template = await compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')
  assert.deepEqual(template({ foo: false, baz: false, quux: true }, html => html), 'corge')

  template = await compile('<if foo and bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: true }, html => html), 'baz')

  template = await compile('<if foo and bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: true }, html => html), '')

  template = await compile('<if foo and bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: false }, html => html), '')

  template = await compile('<if foo and bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: false }, html => html), '')

  template = await compile('<if foo nand bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: true }, html => html), 'baz')

  template = await compile('<if foo nand bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: true }, html => html), '')

  template = await compile('<if foo or bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: true }, html => html), 'baz')

  template = await compile('<if foo or bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: false }, html => html), 'baz')

  template = await compile('<if foo or bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: true }, html => html), 'baz')

  template = await compile('<if foo or bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: false }, html => html), '')

  template = await compile('<if foo xor bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: true }, html => html), 'baz')

  template = await compile('<if foo xor bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: false }, html => html), 'baz')

  template = await compile('<if foo xor bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: false }, html => html), '')

  template = await compile('<if foo xor bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: true }, html => html), '')

  template = await compile('<if foo nor bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: true }, html => html), '')

  template = await compile('<if foo nor bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: false }, html => html), 'baz')

  template = await compile('<if foo eq bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 42 }, html => html), 'baz')

  template = await compile('<if foo eq bar>baz</if>')
  assert.deepEqual(template({ foo: 40, bar: 42 }, html => html), '')

  template = await compile('<if foo eq bar>baz</if>')
  assert.deepEqual(template({ foo: '42', bar: 42 }, html => html), '')

  template = await compile('<if foo neq bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 42 }, html => html), '')

  template = await compile('<if foo neq bar>baz</if>')
  assert.deepEqual(template({ foo: 40, bar: 42 }, html => html), 'baz')

  template = await compile('<if foo neq bar>baz</if>')
  assert.deepEqual(template({ foo: '42', bar: 42 }, html => html), 'baz')

  template = await compile('<if foo neq="bar">baz</if>')
  assert.deepEqual(template({ foo: 'bar', bar: 'bar' }, html => html), '')

  template = await compile('<if foo neq="{42}">baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 42 }, html => html), '')

  template = await compile('<if foo neq="bar">baz</if>')
  assert.deepEqual(template({ foo: 'qux', bar: 'bar' }, html => html), 'baz')

  template = await compile('<if foo neq="{42}">baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 42 }, html => html), 'baz')

  template = await compile('<if foo is equal to="bar">baz</if>')
  assert.deepEqual(template({ foo: 'bar', bar: 'bar' }, html => html), 'baz')

  template = await compile('<if foo is equal to="{42}">baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 42 }, html => html), 'baz')

  template = await compile('<if foo is equal to="bar">baz</if>')
  assert.deepEqual(template({ foo: 'qux', bar: 'bar' }, html => html), '')

  template = await compile('<if foo is equal to="{42}">baz</if>')
  assert.deepEqual(template({ foo: 10, bar: '42' }, html => html), '')

  template = await compile('<if foo is not equal to="bar">baz</if>')
  assert.deepEqual(template({ foo: 'bar', bar: 'bar' }, html => html), '')

  template = await compile('<if foo is not equal to="{42}">baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 42 }, html => html), '')

  template = await compile('<if foo is not equal to="bar">baz</if>')
  assert.deepEqual(template({ foo: 'qux', bar: 'bar' }, html => html), 'baz')

  template = await compile('<if foo is not equal to="{42}">baz</if>')
  assert.deepEqual(template({ foo: 10, bar: '42' }, html => html), 'baz')

  template = await compile('<if foo gt bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 30 }, html => html), 'baz')

  template = await compile('<if foo gt two>baz</if>')
  assert.deepEqual(template({ foo: 42 }, html => html), 'baz')

  template = await compile('<if foo gt two>baz</if>')
  assert.deepEqual(template({ foo: 1 }, html => html), '')

  template = await compile('<if foo gt bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 42 }, html => html), '')

  template = await compile('<if foo gt bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 50 }, html => html), '')

  template = await compile('<if foo gte bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 30 }, html => html), 'baz')

  template = await compile('<if foo gte bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 42 }, html => html), 'baz')

  template = await compile('<if foo gte bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 50 }, html => html), '')

  template = await compile('<if foo lt bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 30 }, html => html), '')

  template = await compile('<if foo lt bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 42 }, html => html), '')

  template = await compile('<if foo lt bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 50 }, html => html), 'baz')

  template = await compile('<if foo lte bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 30 }, html => html), '')

  template = await compile('<if foo lte bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 42 }, html => html), 'baz')

  template = await compile('<if foo lte bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 50 }, html => html), 'baz')

  template = await compile('<if foo lte="{bar.baz - 2}">baz</if>')
  assert.deepEqual(template({ foo: 2, bar: { baz: 10 } }, html => html), 'baz')

  template = await compile('<if foo lte="{bar.baz - 2}">baz</if>')
  assert.deepEqual(template({ foo: 100, bar: { baz: 10 } }, html => html), '')

  template = await compile('<if foo equals bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 42 }, html => html), 'baz')

  template = await compile('<if foo equals bar>baz</if>')
  assert.deepEqual(template({ foo: 40, bar: 42 }, html => html), '')

  template = await compile('<if foo equals bar>baz</if>')
  assert.deepEqual(template({ foo: '42', bar: 42 }, html => html), '')

  template = await compile('<if foo is less than bar>baz</if>')
  assert.deepEqual(template({ foo: 100, bar: 50 }, html => html), '')

  template = await compile('<if foo is less than bar>baz</if>')
  assert.deepEqual(template({ foo: 50, bar: 50 }, html => html), '')

  template = await compile('<if foo is less than bar>baz</if>')
  assert.deepEqual(template({ foo: 30, bar: 40 }, html => html), 'baz')

  template = await compile('<if foo is less than or equals bar>baz</if>')
  assert.deepEqual(template({ foo: 30, bar: 40 }, html => html), 'baz')

  template = await compile('<if foo is less than or equals bar>baz</if>')
  assert.deepEqual(template({ foo: 40, bar: 30 }, html => html), '')

  template = await compile('<if foo is less than or equals bar>baz</if>')
  assert.deepEqual(template({ foo: 30, bar: 30 }, html => html), 'baz')

  template = await compile('<if foo is greater than bar>baz</if>')
  assert.deepEqual(template({ foo: 100, bar: 30 }, html => html), 'baz')

  template = await compile('<if foo is greater than bar>baz</if>')
  assert.deepEqual(template({ foo: 50, bar: 50 }, html => html), '')

  template = await compile('<if foo is greater than bar>baz</if>')
  assert.deepEqual(template({ foo: 30, bar: 50 }, html => html), '')

  template = await compile('<if foo is greater than or equals bar>baz</if>')
  assert.deepEqual(template({ foo: 30, bar: 40 }, html => html), '')

  template = await compile('<if foo is greater than or equals bar>baz</if>')
  assert.deepEqual(template({ foo: 40, bar: 40 }, html => html), 'baz')

  template = await compile('<if foo is greater than or equals bar>baz</if>')
  assert.deepEqual(template({ foo: 50, bar: 40 }, html => html), 'baz')

  template = await compile('<if foo[bar]>baz</if>')
  assert.deepEqual(template({ foo: { bar: true }, bar: 'bar' }, html => html), 'baz')

  template = await compile('<if foo[bar]>baz</if>')
  assert.deepEqual(template({ foo: { bar: false }, bar: 'bar' }, html => html), '')

  template = await compile('<if foo["bar"].baz>ban</if>')
  assert.deepEqual(template({ foo: { bar: { baz: 'baz' } } }, html => html), 'ban')

  template = await compile('<if foo["bar"].baz>ban</if>')
  assert.deepEqual(template({foo: { bar: {} }}, html => html), '')

  template = await compile('<if not foo["bar"].baz>ban</if>')
  assert.deepEqual(template({foo: { bar: {} }}, html => html), 'ban')

  template = await compile('<if foo[qux].baz>ban</if>')
  assert.deepEqual(template({ foo: { bar: { baz: 'baz' } }, qux: 'bar' }, html => html), 'ban')

  template = await compile('<if foo().bar("baz")>baz</if>')
  assert.deepEqual(template({ foo () { return { bar (string) { return string } } } }, html => html), 'baz')

  template = await compile('<if foo().bar("")>baz</if>')
  assert.deepEqual(template({ foo () { return { bar (string) { return string } } } }, html => html), '')

  template = await compile('<if foo is present>bar</if>')
  assert.deepEqual(template({ foo: null }, html => html), 'bar')

  template = await compile('<if foo is present>bar</if>')
  assert.deepEqual(template({ foo: false }, html => html), 'bar')

  template = await compile('<if foo is present>bar</if>')
  assert.deepEqual(template({ foo: true }, html => html), 'bar')

  template = await compile('<if foo is present>bar</if>')
  assert.deepEqual(template({ foo: {} }, html => html), 'bar')

  template = await compile('<if foo is present>bar</if>')
  assert.deepEqual(template({ foo: undefined }, html => html), '')

  template = await compile('<if foo.bar is not present>baz</if>')
  assert.deepEqual(template({ foo: '' }, html => html), 'baz')

  template = await compile('<if foo.bar is not present>baz</if>')
  assert.deepEqual(template({ foo: { bar: 'baz' } }, html => html), '')

  template = await compile('<if foo is not present>baz</if>')
  assert.deepEqual(template({}, html => html), 'baz')

  template = await compile('<if foo is not present>bar</if>')
  assert.deepEqual(template({ foo: undefined }, html => html), 'bar')

  template = await compile('<if foo is defined>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), 'baz')

  template = await compile('<if foo is defined>{bar}</if>')
  assert.deepEqual(template({ foo: {}, bar: 'ban' }, html => html), 'ban')

  template = await compile('<if foo is defined>{bar}</if>')
  assert.deepEqual(template({ foo: null, bar: null }, html => html), 'null')

  template = await compile('<if foo is defined>baz</if>')
  assert.deepEqual(template({ foo: undefined }, html => html), '')

  template = await compile('<if foo are present>bar</if>')
  assert.deepEqual(template({ foo: [] }, html => html), 'bar')

  template = await compile('<if foo are present>bar</if>')
  assert.deepEqual(template({ foo: 'qux' }, html => html), 'bar')

  template = await compile('<if foo are not present>bar</if>')
  assert.deepEqual(template({ foo: undefined }, html => html), 'bar')

  template = await compile('<if foo are not present>bar</if>')
  assert.deepEqual(template({ foo: [] }, html => html), '')

  template = await compile('<if foo are not present>bar</if>')
  assert.deepEqual(template({ foo: 'qux' }, html => html), '')

  template = await compile('<if foo is positive>baz</if>')
  assert.deepEqual(template({ foo: 1 }, html => html), 'baz')

  template = await compile('<if foo is positive>baz</if>')
  assert.deepEqual(template({ foo: 0 }, html => html), '')

  template = await compile('<if foo is positive>baz</if>')
  assert.deepEqual(template({ foo: -1 }, html => html), '')

  template = await compile('<if foo is_positive>baz</if>')
  assert.deepEqual(template({ foo: 1 }, html => html), 'baz')

  template = await compile('<if foo is not positive>baz</if>')
  assert.deepEqual(template({ foo: 1 }, html => html), '')

  template = await compile('<if foo is not positive>baz</if>')
  assert.deepEqual(template({ foo: 0 }, html => html), 'baz')

  template = await compile('<if foo is not positive>baz</if>')
  assert.deepEqual(template({ foo: -1 }, html => html), 'baz')

  template = await compile('<if foo is alpha>baz</if>')
  assert.deepEqual(template({ foo: 'bar' }, html => html), 'baz')

  template = await compile('<if foo is alpha>baz</if>')
  assert.deepEqual(template({ foo: '' }, html => html), 'baz')

  template = await compile('<if foo is alpha>baz</if>')
  assert.deepEqual(template({ foo: 'BaR' }, html => html), 'baz')

  template = await compile('<if foo is alpha>baz</if>')
  assert.deepEqual(template({ foo: '123' }, html => html), '')

  template = await compile('<if foo is alpha>baz</if>')
  assert.deepEqual(template({ foo: 'bar baz' }, html => html), '')

  template = await compile('<if foo is not alpha>baz</if>')
  assert.deepEqual(template({ foo: 'bar' }, html => html), '')

  template = await compile('<if foo is not alpha>baz</if>')
  assert.deepEqual(template({ foo: '' }, html => html), '')

  template = await compile('<if foo is not alpha>baz</if>')
  assert.deepEqual(template({ foo: 'BaR' }, html => html), '')

  template = await compile('<if foo is not alpha>baz</if>')
  assert.deepEqual(template({ foo: '123' }, html => html), 'baz')

  template = await compile('<if foo is not alpha>baz</if>')
  assert.deepEqual(template({ foo: 'bar baz' }, html => html), 'baz')

  template = await compile('<if foo is not alphanumeric>baz</if>')
  assert.deepEqual(template({ foo: '1234' }, html => html), '')

  template = await compile('<if foo is not alphanumeric>baz</if>')
  assert.deepEqual(template({ foo: '' }, html => html), '')

  template = await compile('<if foo is not alphanumeric>baz</if>')
  assert.deepEqual(template({ foo: '1234bar' }, html => html), '')

  template = await compile('<if foo is negative>baz</if>')
  assert.deepEqual(template({ foo: 1 }, html => html), '')

  template = await compile('<if foo is negative>baz</if>')
  assert.deepEqual(template({ foo: 0 }, html => html), '')

  template = await compile('<if foo is negative>baz</if>')
  assert.deepEqual(template({ foo: -1 }, html => html), 'baz')

  template = await compile('<if foo is not negative>baz</if>')
  assert.deepEqual(template({ foo: 1 }, html => html), 'baz')

  template = await compile('<if foo is not negative>baz</if>')
  assert.deepEqual(template({ foo: 0 }, html => html), 'baz')

  template = await compile('<if foo is not negative>baz</if>')
  assert.deepEqual(template({ foo: -1 }, html => html), '')

  template = await compile('<if foo is finite>baz</if>')
  assert.deepEqual(template({ foo: 100 }, html => html), 'baz')

  template = await compile('<if foo is finite>baz</if>')
  assert.deepEqual(template({ foo: Infinity }, html => html), '')

  template = await compile('<if foo is finite>baz</if>')
  assert.deepEqual(template({ foo: -Infinity }, html => html), '')

  template = await compile('<if foo is finite>baz</if>')
  assert.deepEqual(template({ foo: 0 }, html => html), 'baz')

  template = await compile('<if foo is finite>baz</if>')
  assert.deepEqual(template({ foo: NaN }, html => html), '')

  template = await compile('<if foo is finite>baz</if>')
  assert.deepEqual(template({ foo: 2e64 }, html => html), 'baz')

  template = await compile('<if foo is not finite>baz</if>')
  assert.deepEqual(template({ foo: 100 }, html => html), '')

  template = await compile('<if foo is not finite>baz</if>')
  assert.deepEqual(template({ foo: Infinity }, html => html), 'baz')

  template = await compile('<if foo is not finite>baz</if>')
  assert.deepEqual(template({ foo: -Infinity }, html => html), 'baz')

  template = await compile('<if foo is infinite>baz</if>')
  assert.deepEqual(template({ foo: 100 }, html => html), '')

  template = await compile('<if foo is infinite>baz</if>')
  assert.deepEqual(template({ foo: Infinity }, html => html), 'baz')

  template = await compile('<if foo is infinite>baz</if>')
  assert.deepEqual(template({ foo: -Infinity }, html => html), 'baz')

  template = await compile('<if foo is infinite>baz</if>')
  assert.deepEqual(template({ foo: 0 }, html => html), '')

  template = await compile('<if foo is infinite>baz</if>')
  assert.deepEqual(template({ foo: NaN }, html => html), '')

  template = await compile('<if foo is infinite>baz</if>')
  assert.deepEqual(template({ foo: 2e1000 }, html => html), 'baz')

  template = await compile('<if foo is not infinite>baz</if>')
  assert.deepEqual(template({ foo: Infinity }, html => html), '')

  template = await compile('<if foo is not infinite>baz</if>')
  assert.deepEqual(template({ foo: -Infinity }, html => html), '')

  template = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: [] }, html => html), 'baz')

  template = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: [{ baz: 'bar' }, {}] }, html => html), '')

  template = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: '' }, html => html), 'baz')

  template = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: 'qux' }, html => html), '')

  template = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: null }, html => html), 'baz')

  template = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: undefined }, html => html), 'baz')

  template = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), 'baz')

  template = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: { bar: null } }, html => html), '')

  template = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: { 1: 'bar', 2: 'baz' } }, html => html), '')

  template = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: { bar: 'ban' } }, html => html), '')

  template = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: function () {} }, html => html), 'baz')

  template = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: new Map() }, html => html), 'baz')

  template = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: new Map([['foo', 'bar'], ['baz', 'ban']]) }, html => html), '')

  template = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: new Set() }, html => html), 'baz')

  template = await compile('<if foo is empty>baz</if>')
  assert.deepEqual(template({ foo: new Set([1, 'foo', 'bar']) }, html => html), '')

  template = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: [] }, html => html), '')

  template = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: [{ baz: 'bar' }, {}] }, html => html), 'baz')

  template = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: '' }, html => html), '')

  template = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: 'qux' }, html => html), 'baz')

  template = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: null }, html => html), '')

  template = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: undefined }, html => html), '')

  template = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), '')

  template = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: { bar: null } }, html => html), 'baz')

  template = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: { 1: 'bar', 2: 'baz' } }, html => html), 'baz')

  template = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: { bar: 'ban' } }, html => html), 'baz')

  template = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: function () {} }, html => html), '')

  template = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: new Map() }, html => html), '')

  template = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: new Map([['foo', 'bar'], ['baz', 'ban']]) }, html => html), 'baz')

  template = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: new Set() }, html => html), '')

  template = await compile('<if foo is not empty>baz</if>')
  assert.deepEqual(template({ foo: new Set([1, 'foo', 'bar']) }, html => html), 'baz')

  template = await compile('<if foo are empty>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4] }, html => html), '')

  template = await compile('<if foo are empty>baz</if>')
  assert.deepEqual(template({ foo: [[], [], []] }, html => html), '')

  template = await compile('<if foo are empty>baz</if>')
  assert.deepEqual(template({ foo: [{ baz: 'bar' }, {}] }, html => html), '')

  template = await compile('<if foo are not empty>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4] }, html => html), 'baz')

  template = await compile('<if foo are not empty>baz</if>')
  assert.deepEqual(template({ foo: [[], [], []] }, html => html), 'baz')

  template = await compile('<if foo are not empty>baz</if>')
  assert.deepEqual(template({ foo: [{ baz: 'bar' }, {}] }, html => html), 'baz')

  template = await compile('<if foo is an empty array>baz</if>')
  assert.deepEqual(template({ foo: [] }, html => html), 'baz')

  template = await compile('<if foo is an empty array>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4] }, html => html), '')

  template = await compile('<if foo is not an empty array>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4] }, html => html), 'baz')

  template = await compile('<if foo is an empty string>baz</if>')
  assert.deepEqual(template({ foo: '' }, html => html), 'baz')

  template = await compile('<if foo is an empty string>baz</if>')
  assert.deepEqual(template({ foo: 'foo' }, html => html), '')

  template = await compile('<if foo is not an empty string>baz</if>')
  assert.deepEqual(template({ foo: 'foo' }, html => html), 'baz')

  template = await compile('<if foo is an empty set>baz</if>')
  assert.deepEqual(template({ foo: new Set([]) }, html => html), 'baz')

  template = await compile('<if foo is an empty set>baz</if>')
  assert.deepEqual(template({ foo: new Set([1, 2, 3, 4]) }, html => html), '')

  template = await compile('<if foo is not an empty set>baz</if>')
  assert.deepEqual(template({ foo: new Set([1, 2, 3, 4]) }, html => html), 'baz')

  template = await compile('<if foo is an empty map>baz</if>')
  assert.deepEqual(template({ foo: new Map([]) }, html => html), 'baz')

  template = await compile('<if foo is an empty map>baz</if>')
  assert.deepEqual(template({ foo: new Map([ [{}, 'bar'] ]) }, html => html), '')

  template = await compile('<if foo is not an empty map>baz</if>')
  assert.deepEqual(template({ foo: new Map([ [{}, 'bar'] ]) }, html => html), 'baz')

  template = await compile('<if foo is an array>baz</if>')
  assert.deepEqual(template({ foo: [] }, html => html), 'baz')

  template = await compile('<if foo is an array>baz</if>')
  assert.deepEqual(template({ foo: '' }, html => html), '')

  template = await compile('<if foo is an array>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), '')

  template = await compile('<if foo is not an array>baz</if>')
  assert.deepEqual(template({ foo: [] }, html => html), '')

  template = await compile('<if foo is not an array>baz</if>')
  assert.deepEqual(template({ foo: '' }, html => html), 'baz')

  template = await compile('<if foo is not an array>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), 'baz')

  template = await compile('<if foo is a string>baz</if>')
  assert.deepEqual(template({ foo: '' }, html => html), 'baz')

  template = await compile('<if foo is a string>baz</if>')
  assert.deepEqual(template({ foo: 'foo' }, html => html), 'baz')

  template = await compile('<if foo is a string>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), '')

  template = await compile('<if foo is not a string>baz</if>')
  assert.deepEqual(template({ foo: '' }, html => html), '')

  template = await compile('<if foo is not a string>baz</if>')
  assert.deepEqual(template({ foo: 'foo' }, html => html), '')

  template = await compile('<if foo is not a string>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), 'baz')

  template = await compile('<if foo is a number>baz</if>')
  assert.deepEqual(template({ foo: [] }, html => html), '')

  template = await compile('<if foo is a number>baz</if>')
  assert.deepEqual(template({ foo: 13 }, html => html), 'baz')

  template = await compile('<if foo is a number>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), '')

  template = await compile('<if foo is not a number>baz</if>')
  assert.deepEqual(template({ foo: [] }, html => html), 'baz')

  template = await compile('<if foo is not a number>baz</if>')
  assert.deepEqual(template({ foo: 13 }, html => html), '')

  template = await compile('<if foo is not a number>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), 'baz')

  template = await compile('<if foo is a multiple of bar>baz</if>')
  assert.deepEqual(template({ foo: 100, bar: 10 }, html => html), 'baz')

  template = await compile('<if foo is a multiple of bar>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 11 }, html => html), 'baz')

  template = await compile('<if foo is a multiple of bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 9 }, html => html), '')

  template = await compile('<if foo is not a multiple of bar>baz</if>')
  assert.deepEqual(template({ foo: 42, bar: 9 }, html => html), 'baz')

  template = await compile('<if foo is numeric>baz</if>')
  assert.deepEqual(template({ foo: '-10' }, html => html), 'baz')

  template = await compile('<if foo is numeric>baz</if>')
  assert.deepEqual(template({ foo: '0' }, html => html), 'baz')

  template = await compile('<if foo is numeric>baz</if>')
  assert.deepEqual(template({ foo: '0xFF' }, html => html), 'baz')

  template = await compile('<if foo is not numeric>baz</if>')
  assert.deepEqual(template({ foo: true }, html => html), 'baz')

  template = await compile('<if foo is not numeric>baz</if>')
  assert.deepEqual(template({ foo: null }, html => html), 'baz')

  template = await compile('<if foo is not numeric>baz</if>')
  assert.deepEqual(template({ foo: undefined }, html => html), 'baz')

  template = await compile('<if foo is a symbol>baz</if>')
  assert.deepEqual(template({ foo: Symbol('foo') }, html => html), 'baz')

  template = await compile('<if foo is a symbol>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), '')

  template = await compile('<if foo is not a symbol>baz</if>')
  assert.deepEqual(template({ foo: Symbol('foo') }, html => html), '')

  template = await compile('<if foo is not a symbol>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), 'baz')

  template = await compile('<if foo is a map>baz</if>')
  assert.deepEqual(template({ foo: new Map() }, html => html), 'baz')

  template = await compile('<if foo is a map>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), '')

  template = await compile('<if foo is a map>baz</if>')
  assert.deepEqual(template({ foo: [] }, html => html), '')

  template = await compile('<if foo is not a map>baz</if>')
  assert.deepEqual(template({ foo: new Map() }, html => html), '')

  template = await compile('<if foo is not a map>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), 'baz')

  template = await compile('<if foo is not a map>baz</if>')
  assert.deepEqual(template({ foo: [] }, html => html), 'baz')

  template = await compile('<if foo is a weakmap>baz</if>')
  assert.deepEqual(template({ foo: new WeakMap() }, html => html), 'baz')

  template = await compile('<if foo is a weakmap>baz</if>')
  assert.deepEqual(template({ foo: new WeakMap([ [{}, 'foo'], [{}, 'bar'] ]) }, html => html), 'baz')

  template = await compile('<if foo is a weakmap>baz</if>')
  assert.deepEqual(template({ foo: new Map() }, html => html), '')

  template = await compile('<if foo is not a weakmap>baz</if>')
  assert.deepEqual(template({ foo: new WeakMap() }, html => html), '')

  template = await compile('<if foo is not a weakmap>baz</if>')
  assert.deepEqual(template({ foo: new WeakMap([ [{}, 'foo'], [{}, 'bar'] ]) }, html => html), '')

  template = await compile('<if foo is not a weakmap>baz</if>')
  assert.deepEqual(template({ foo: new Map() }, html => html), 'baz')

  template = await compile('<if foo is a set>baz</if>')
  assert.deepEqual(template({ foo: new Set() }, html => html), 'baz')

  template = await compile('<if foo is a set>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), '')

  template = await compile('<if foo is a set>baz</if>')
  assert.deepEqual(template({ foo: [] }, html => html), '')

  template = await compile('<if foo is not a set>baz</if>')
  assert.deepEqual(template({ foo: new Set() }, html => html), '')

  template = await compile('<if foo is not a set>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), 'baz')

  template = await compile('<if foo is not a set>baz</if>')
  assert.deepEqual(template({ foo: [] }, html => html), 'baz')

  template = await compile('<if foo is a weakset>baz</if>')
  assert.deepEqual(template({ foo: new WeakSet() }, html => html), 'baz')

  template = await compile('<if foo is a weakset>baz</if>')
  assert.deepEqual(template({ foo: new WeakSet([ {} ]) }, html => html), 'baz')

  template = await compile('<if foo is a weakset>baz</if>')
  assert.deepEqual(template({ foo: new Set() }, html => html), '')

  template = await compile('<if foo is not a weakset>baz</if>')
  assert.deepEqual(template({ foo: new Set() }, html => html), 'baz')

  template = await compile('<if foo is a boolean>baz</if>')
  assert.deepEqual(template({ foo: true }, html => html), 'baz')

  template = await compile('<if foo is a boolean>baz</if>')
  assert.deepEqual(template({ foo: false }, html => html), 'baz')

  template = await compile('<if foo is not a boolean>baz</if>')
  assert.deepEqual(template({ foo: true }, html => html), '')

  template = await compile('<if foo is not a boolean>baz</if>')
  assert.deepEqual(template({ foo: '' }, html => html), 'baz')

  template = await compile('<if foo is undefined>baz</if>')
  assert.deepEqual(template({ foo: undefined }, html => html), 'baz')

  template = await compile('<if foo is undefined>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), '')

  template = await compile('<if foo is not undefined>baz</if>')
  assert.deepEqual(template({ foo: undefined }, html => html), '')

  template = await compile('<if foo is not undefined>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), 'baz')

  template = await compile('<if foo is null>baz</if>')
  assert.deepEqual(template({ foo: null }, html => html), 'baz')

  template = await compile('<if foo is not null>baz</if>')
  assert.deepEqual(template({ foo: null }, html => html), '')

  template = await compile('<if foo is void>baz</if>')
  assert.deepEqual(template({ foo: undefined }, html => html), 'baz')

  template = await compile('<if foo is void>baz</if>')
  assert.deepEqual(template({ foo: void 0 }, html => html), 'baz')

  template = await compile('<if foo is null>baz</if>')
  assert.deepEqual(template({ foo: void 0 }, html => html), '')

  template = await compile('<if foo is not void>baz</if>')
  assert.deepEqual(template({ foo: undefined }, html => html), '')

  template = await compile('<if foo is not void>baz</if>')
  assert.deepEqual(template({ foo: void 0 }, html => html), '')

  template = await compile('<if foo is not null>baz</if>')
  assert.deepEqual(template({ foo: void 0 }, html => html), 'baz')

  template = await compile('<if foo is an object>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), 'baz')

  template = await compile('<if foo is an object>baz</if>')
  assert.deepEqual(template({ foo: null }, html => html), '')

  template = await compile('<if foo is an object>baz</if>')
  assert.deepEqual(template({ foo: function () {} }, html => html), 'baz')

  template = await compile('<if foo is not an object>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), '')

  template = await compile('<if foo is not an object>baz</if>')
  assert.deepEqual(template({ foo: null }, html => html), 'baz')

  template = await compile('<if foo is not an object>baz</if>')
  assert.deepEqual(template({ foo: function () {} }, html => html), '')

  template = await compile('<if foo is a regexp>baz</if>')
  assert.deepEqual(template({ foo: /regexp/ }, html => html), 'baz')

  template = await compile('<if foo is a regexp>baz</if>')
  assert.deepEqual(template({ foo: new RegExp('regexp') }, html => html), 'baz')

  template = await compile('<if foo is a regexp>baz</if>')
  assert.deepEqual(template({ foo: '' }, html => html), '')

  template = await compile('<if foo is not a regexp>baz</if>')
  assert.deepEqual(template({ foo: /regexp/ }, html => html), '')

  template = await compile('<if foo is not a regexp>baz</if>')
  assert.deepEqual(template({ foo: new RegExp('regexp') }, html => html), '')

  template = await compile('<if foo is not a regexp>baz</if>')
  assert.deepEqual(template({ foo: '' }, html => html), 'baz')

  template = await compile('<if foo is a regex>baz</if>')
  assert.deepEqual(template({ foo: /regexp/ }, html => html), 'baz')

  template = await compile('<if foo is a regex>baz</if>')
  assert.deepEqual(template({ foo: new RegExp('regexp') }, html => html), 'baz')

  template = await compile('<if foo is a regex>baz</if>')
  assert.deepEqual(template({ foo: '' }, html => html), '')

  template = await compile('<if foo is not a regex>baz</if>')
  assert.deepEqual(template({ foo: /regexp/ }, html => html), '')

  template = await compile('<if foo is not a regex>baz</if>')
  assert.deepEqual(template({ foo: new RegExp('regexp') }, html => html), '')

  template = await compile('<if foo is not a regex>baz</if>')
  assert.deepEqual(template({ foo: '' }, html => html), 'baz')

  template = await compile('<if foo is a date>baz</if>')
  assert.deepEqual(template({ foo: new Date() }, html => html), 'baz')

  template = await compile('<if foo is a date>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 15, 4) }, html => html), 'baz')

  template = await compile('<if foo is a date>baz</if>')
  assert.deepEqual(template({ foo: '08.09.2018' }, html => html), '')

  template = await compile('<if foo is not a date>baz</if>')
  assert.deepEqual(template({ foo: new Date() }, html => html), '')

  template = await compile('<if foo is not a date>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 15, 4) }, html => html), '')

  template = await compile('<if foo is not a date>baz</if>')
  assert.deepEqual(template({ foo: '08.09.2018' }, html => html), 'baz')

  template = await compile('<if foo is even>baz</if>')
  assert.deepEqual(template({ foo: 2 }, html => html), 'baz')

  template = await compile('<if foo is even>baz</if>')
  assert.deepEqual(template({ foo: 0 }, html => html), 'baz')

  template = await compile('<if foo is even>baz</if>')
  assert.deepEqual(template({ foo: 1 }, html => html), '')

  template = await compile('<if foo is even>baz</if>')
  assert.deepEqual(template({ foo: 'baz' }, html => html), '')

  template = await compile('<if foo is even>baz</if>')
  assert.deepEqual(template({ foo: [1, 2] }, html => html), '')

  template = await compile('<if foo is even>baz</if>')
  assert.deepEqual(template({ foo: [1, 2].length }, html => html), 'baz')

  template = await compile('<if foo is not even>baz</if>')
  assert.deepEqual(template({ foo: 2 }, html => html), '')

  template = await compile('<if foo is not even>baz</if>')
  assert.deepEqual(template({ foo: 0 }, html => html), '')

  template = await compile('<if foo is not even>baz</if>')
  assert.deepEqual(template({ foo: 1 }, html => html), 'baz')

  template = await compile('<if foo is not even>baz</if>')
  assert.deepEqual(template({ foo: 'baz' }, html => html), 'baz')

  template = await compile('<if foo is not even>baz</if>')
  assert.deepEqual(template({ foo: [1, 2] }, html => html), 'baz')

  template = await compile('<if foo is not even>baz</if>')
  assert.deepEqual(template({ foo: [1, 2].length }, html => html), '')

  template = await compile('<if foo is odd>baz</if>')
  assert.deepEqual(template({ foo: 1 }, html => html), 'baz')

  template = await compile('<if foo is odd>baz</if>')
  assert.deepEqual(template({ foo: 2 }, html => html), '')

  template = await compile('<if foo is odd>baz</if>')
  assert.deepEqual(template({ foo: [1].length }, html => html), 'baz')

  template = await compile('<if foo is not odd>baz</if>')
  assert.deepEqual(template({ foo: 1 }, html => html), '')

  template = await compile('<if foo is not odd>baz</if>')
  assert.deepEqual(template({ foo: 2 }, html => html), 'baz')

  template = await compile('<if foo is not odd>baz</if>')
  assert.deepEqual(template({ foo: [1].length }, html => html), '')

  template = await compile('<if foo bitwise or bar>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 0 }, html => html), '')

  template = await compile('<if foo bitwise or bar>baz</if>')
  assert.deepEqual(template({ foo: 1, bar: 1 }, html => html), 'baz')

  template = await compile('<if foo bitwise or bar>baz</if>')
  assert.deepEqual(template({ foo: 1, bar: 0 }, html => html), 'baz')

  template = await compile('<if foo bitwise or bar>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 1 }, html => html), 'baz')

  template = await compile('<if foo bitwise and bar>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 0 }, html => html), '')

  template = await compile('<if foo bitwise and bar>baz</if>')
  assert.deepEqual(template({ foo: 1, bar: 1 }, html => html), 'baz')

  template = await compile('<if foo bitwise and bar>baz</if>')
  assert.deepEqual(template({ foo: 1, bar: 0 }, html => html), '')

  template = await compile('<if foo bitwise and bar>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 1 }, html => html), '')

  template = await compile('<if foo bitwise and bar>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 0 }, html => html), '')

  template = await compile('<if foo bitwise and bar>baz</if>')
  assert.deepEqual(template({ foo: 1, bar: 1 }, html => html), 'baz')

  template = await compile('<if foo bitwise and bar>baz</if>')
  assert.deepEqual(template({ foo: 1, bar: 0 }, html => html), '')

  template = await compile('<if foo bitwise and bar>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 1 }, html => html), '')

  template = await compile('<if foo bitwise xor bar>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 0 }, html => html), '')

  template = await compile('<if foo bitwise xor bar>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 1 }, html => html), 'baz')

  template = await compile('<if foo bitwise xor bar>baz</if>')
  assert.deepEqual(template({ foo: 1, bar: 0 }, html => html), 'baz')

  template = await compile('<if foo bitwise xor bar>baz</if>')
  assert.deepEqual(template({ foo: 1, bar: 1 }, html => html), '')

  template = await compile('<if not foo>baz</if>')
  assert.deepEqual(template({ foo: null }, html => html), 'baz')

  template = await compile('<if not foo>baz</if>')
  assert.deepEqual(template({ foo: undefined }, html => html), 'baz')

  template = await compile('<if not foo>baz</if>')
  assert.deepEqual(template({ foo: false }, html => html), 'baz')

  template = await compile('<if not foo>baz</if>')
  assert.deepEqual(template({}, html => html), 'baz')

  template = await compile('<if not foo>baz</if>')
  assert.deepEqual(template({ foo: true }, html => html), '')

  template = await compile('<if not foo>baz</if>')
  assert.deepEqual(template({ foo: { bar: {} } }, html => html), '')

  template = await compile('<if foo is a video>baz</if>')
  assert.deepEqual(template({ foo: 'foo.flv' }, html => html), 'baz')

  template = await compile('<if foo is a video>baz</if>')
  assert.deepEqual(template({ foo: 'foo.mp3' }, html => html), '')

  template = await compile('<if foo is a video>baz</if>')
  assert.deepEqual(template({ foo: 'fooflv' }, html => html), '')

  template = await compile('<if foo is not a video>baz</if>')
  assert.deepEqual(template({ foo: 'fooflv' }, html => html), 'baz')

  template = await compile('<if foo is an image>baz</if>')
  assert.deepEqual(template({ foo: 'foo.png' }, html => html), 'baz')

  template = await compile('<if foo is an image>baz</if>')
  assert.deepEqual(template({ foo: 'foo.svg' }, html => html), 'baz')

  template = await compile('<if foo is an image>baz</if>')
  assert.deepEqual(template({ foo: 'foobmp' }, html => html), '')

  template = await compile('<if foo is not an image>baz</if>')
  assert.deepEqual(template({ foo: 'foo.bmp' }, html => html), '')

  template = await compile('<if foo is an audio>baz</if>')
  assert.deepEqual(template({ foo: 'foo.flac' }, html => html), 'baz')

  template = await compile('<if foo is an audio>baz</if>')
  assert.deepEqual(template({ foo: 'foo.ogg' }, html => html), 'baz')

  template = await compile('<if foo is an audio>baz</if>')
  assert.deepEqual(template({ foo: 'foomp3' }, html => html), '')

  template = await compile('<if foo is not an audio>baz</if>')
  assert.deepEqual(template({ foo: 'foomp3' }, html => html), 'baz')

  template = await compile('<if foo has an extension of bar>baz</if>')
  assert.deepEqual(template({ foo: 'foo.mp3', bar: 'mp3' }, html => html), 'baz')

  template = await compile('<if foo has extension of={"jpg"}>baz</if>')
  assert.deepEqual(template({ foo: 'foo.jpg' }, html => html), 'baz')

  template = await compile('<if foo has an extension of bar>baz</if>')
  assert.deepEqual(template({ foo: 'foo.mp3', bar: '.ogg' }, html => html), '')

  template = await compile('<if foo does not have an extension of bar>baz</if>')
  assert.deepEqual(template({ foo: 'foo.mp3', bar: '.ogg' }, html => html), 'baz')

  template = await compile('<if foo has a whitespace>baz</if>')
  assert.deepEqual(template({ foo: 'foo&nbsp;bar' }, html => html), 'baz')

  template = await compile('<if foo has a whitespace>baz</if>')
  assert.deepEqual(template({ foo: 'foobar' }, html => html), '')

  template = await compile('<if foo has a whitespace>baz</if>')
  assert.deepEqual(template({ foo: '\n' }, html => html), 'baz')

  template = await compile('<if foo has a whitespace>baz</if>')
  assert.deepEqual(template({ foo: '&nbsp;' }, html => html), 'baz')

  template = await compile('<if foo does not have a whitespace>baz</if>')
  assert.deepEqual(template({ foo: 'foobar' }, html => html), 'baz')

  template = await compile('<if foo does not have a whitespace>baz</if>')
  assert.deepEqual(template({ foo: 'foo bar' }, html => html), '')

  template = await compile('<if foo has a newline>baz</if>')
  assert.deepEqual(template({ foo: 'foo\nbar' }, html => html), 'baz')

  template = await compile('<if foo has a newline>baz</if>')
  assert.deepEqual(template({ foo: 'foo\tbar' }, html => html), '')

  template = await compile('<if foo does not have a newline>baz</if>')
  assert.deepEqual(template({ foo: 'foo\nbar' }, html => html), '')

  template = await compile('<if foo does not have a newline>baz</if>')
  assert.deepEqual(template({ foo: 'foo\tbar' }, html => html), 'baz')

  template = await compile('<if foo has a number>baz</if>')
  assert.deepEqual(template({ foo: { bar: 4 } }, html => html), 'baz')

  template = await compile('<if foo has a number>baz</if>')
  assert.deepEqual(template({ foo: 'bar' }, html => html), '')

  template = await compile('<if foo has a number>baz</if>')
  assert.deepEqual(template({ foo: [1, 2] }, html => html), 'baz')

  template = await compile('<if foo has a number>baz</if>')
  assert.deepEqual(template({ foo: [{}, 'bar', 'baz'] }, html => html), '')

  template = await compile('<if foo has a number>baz</if>')
  assert.deepEqual(template({ foo: [{}, 4, 'baz'] }, html => html), 'baz')

  template = await compile('<if foo has a number>baz</if>')
  assert.deepEqual(template({ foo: 4 }, html => html), 'baz')

  template = await compile('<if foo is true>baz</if>')
  assert.deepEqual(template({ foo: true }, html => html), 'baz')

  template = await compile('<if foo is true>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), 'baz')

  template = await compile('<if foo is true>baz</if>')
  assert.deepEqual(template({ foo: [] }, html => html), 'baz')

  template = await compile('<if foo is true>baz</if>')
  assert.deepEqual(template({ foo: false }, html => html), '')

  template = await compile('<if foo is true>baz</if>')
  assert.deepEqual(template({ foo: 0 }, html => html), '')

  template = await compile('<if foo is true>baz</if>')
  assert.deepEqual(template({ foo: null }, html => html), '')

  template = await compile('<if foo is true>baz</if>')
  assert.deepEqual(template({ foo: undefined }, html => html), '')

  template = await compile('<if foo is true>baz</if>')
  assert.deepEqual(template({ foo: '' }, html => html), '')

  template = await compile('<if foo is true>baz</if>')
  assert.deepEqual(template({ foo: NaN }, html => html), '')

  template = await compile('<if foo is not true>baz</if>')
  assert.deepEqual(template({ foo: false }, html => html), 'baz')

  template = await compile('<if foo is not true>baz</if>')
  assert.deepEqual(template({ foo: 'bar' }, html => html), '')

  template = await compile('<if foo is truthy>baz</if>')
  assert.deepEqual(template({ foo: true }, html => html), 'baz')

  template = await compile('<if foo is truthy>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), 'baz')

  template = await compile('<if foo is truthy>baz</if>')
  assert.deepEqual(template({ foo: [] }, html => html), 'baz')

  template = await compile('<if foo is truthy>baz</if>')
  assert.deepEqual(template({ foo: false }, html => html), '')

  template = await compile('<if foo is truthy>baz</if>')
  assert.deepEqual(template({ foo: 0 }, html => html), '')

  template = await compile('<if foo is truthy>baz</if>')
  assert.deepEqual(template({ foo: null }, html => html), '')

  template = await compile('<if foo is truthy>baz</if>')
  assert.deepEqual(template({ foo: undefined }, html => html), '')

  template = await compile('<if foo is truthy>baz</if>')
  assert.deepEqual(template({ foo: '' }, html => html), '')

  template = await compile('<if foo is truthy>baz</if>')
  assert.deepEqual(template({ foo: NaN }, html => html), '')

  template = await compile('<if foo is not truthy>baz</if>')
  assert.deepEqual(template({ foo: false }, html => html), 'baz')

  template = await compile('<if foo is not truthy>baz</if>')
  assert.deepEqual(template({ foo: 'bar' }, html => html), '')

  template = await compile('<if foo is false>baz</if>')
  assert.deepEqual(template({ foo: false }, html => html), 'baz')

  template = await compile('<if foo is false>baz</if>')
  assert.deepEqual(template({ foo: 0 }, html => html), 'baz')

  template = await compile('<if foo is false>baz</if>')
  assert.deepEqual(template({ foo: null }, html => html), 'baz')

  template = await compile('<if foo is false>baz</if>')
  assert.deepEqual(template({ foo: undefined }, html => html), 'baz')

  template = await compile('<if foo is false>baz</if>')
  assert.deepEqual(template({ foo: '' }, html => html), 'baz')

  template = await compile('<if foo is false>baz</if>')
  assert.deepEqual(template({ foo: NaN }, html => html), 'baz')

  template = await compile('<if foo is false>baz</if>')
  assert.deepEqual(template({ foo: true }, html => html), '')

  template = await compile('<if foo is false>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), '')

  template = await compile('<if foo is false>baz</if>')
  assert.deepEqual(template({ foo: [] }, html => html), '')

  template = await compile('<if foo is not false>baz</if>')
  assert.deepEqual(template({ foo: true }, html => html), 'baz')

  template = await compile('<if foo is not false>baz</if>')
  assert.deepEqual(template({ foo: 'bar' }, html => html), 'baz')

  template = await compile('<if foo is falsy>baz</if>')
  assert.deepEqual(template({ foo: false }, html => html), 'baz')

  template = await compile('<if foo is falsy>baz</if>')
  assert.deepEqual(template({ foo: 0 }, html => html), 'baz')

  template = await compile('<if foo is falsy>baz</if>')
  assert.deepEqual(template({ foo: null }, html => html), 'baz')

  template = await compile('<if foo is falsy>baz</if>')
  assert.deepEqual(template({ foo: undefined }, html => html), 'baz')

  template = await compile('<if foo is falsy>baz</if>')
  assert.deepEqual(template({ foo: '' }, html => html), 'baz')

  template = await compile('<if foo is falsy>baz</if>')
  assert.deepEqual(template({ foo: NaN }, html => html), 'baz')

  template = await compile('<if foo is falsy>baz</if>')
  assert.deepEqual(template({ foo: true }, html => html), '')

  template = await compile('<if foo is falsy>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), '')

  template = await compile('<if foo is falsy>baz</if>')
  assert.deepEqual(template({ foo: [] }, html => html), '')

  template = await compile('<if foo is not falsy>baz</if>')
  assert.deepEqual(template({ foo: true }, html => html), 'baz')

  template = await compile('<if foo is not falsy>baz</if>')
  assert.deepEqual(template({ foo: 'bar' }, html => html), 'baz')

  template = await compile('<if foo is divisible by bar>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 5 }, html => html), 'baz')

  template = await compile('<if foo is not divisible by bar>baz</if>')
  assert.deepEqual(template({ foo: 5, bar: 10 }, html => html), 'baz')

  template = await compile('<if foo is divisible by="{10}">baz</if>')
  assert.deepEqual(template({ foo: 10 }, html => html), 'baz')

  template = await compile('<if foo is not divisible by="{10}">baz</if>')
  assert.deepEqual(template({ foo: 5 }, html => html), 'baz')

  template = await compile('<if foo is divisible by={bar}>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 5 }, html => html), 'baz')

  template = await compile('<if foo is not divisible by={bar}>baz</if>')
  assert.deepEqual(template({ foo: 5, bar: 10 }, html => html), 'baz')

  template = await compile('<if foo is divisible by five>baz</if>')
  assert.deepEqual(template({ foo: 10 }, html => html), 'baz')

  template = await compile('<if foo is divisible by five>baz</if>')
  assert.deepEqual(template({ foo: 6 }, html => html), '')

  template = await compile('<if foo is not divisible by five>baz</if>')
  assert.deepEqual(template({ foo: 6 }, html => html), 'baz')

  template = await compile('<if foo is prime>baz</if>')
  assert.deepEqual(template({ foo: 3 }, html => html), 'baz')

  template = await compile('<if foo is prime>baz</if>')
  assert.deepEqual(template({ foo: 5 }, html => html), 'baz')

  template = await compile('<if foo is prime>baz</if>')
  assert.deepEqual(template({ foo: 1 }, html => html), '')

  template = await compile('<if foo is not prime>baz</if>')
  assert.deepEqual(template({ foo: 1 }, html => html), 'baz')

  template = await compile('<if foo is a palindrome>baz</if>')
  assert.deepEqual(template({ foo: 'madam' }, html => html), 'baz')

  template = await compile('<if foo is a palindrome>baz</if>')
  assert.deepEqual(template({ foo: 'foo' }, html => html), '')

  template = await compile('<if foo is not a palindrome>baz</if>')
  assert.deepEqual(template({ foo: 'foo' }, html => html), 'baz')

  template = await compile('<if foo is sooner than bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 4, 1), bar: new Date(2018, 4, 29) }, html => html), 'baz')

  template = await compile('<if foo is sooner than bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 4, 29), bar: new Date(2018, 4, 11) }, html => html), '')

  template = await compile('<if foo is not sooner than bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 4, 29), bar: new Date(2018, 4, 11) }, html => html), 'baz')

  template = await compile('<if foo is later than bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 4, 29), bar: new Date(2018, 4, 11) }, html => html), 'baz')

  template = await compile('<if foo is later than bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 4, 1), bar: new Date(2018, 4, 29) }, html => html), '')

  template = await compile('<if foo is not later than bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 4, 1), bar: new Date(2018, 4, 29) }, html => html), 'baz')

  template = await compile('<if foo is before bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 5, 27), bar: new Date(2018, 5, 29) }, html => html), 'baz')

  template = await compile('<if foo is before bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 5, 29), bar: new Date(2018, 5, 27) }, html => html), '')

  template = await compile('<if foo is not before bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 5, 29), bar: new Date(2018, 5, 27) }, html => html), 'baz')

  template = await compile('<if foo is after bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 5, 29), bar: new Date(2018, 5, 27) }, html => html), 'baz')

  template = await compile('<if foo is after bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 5, 27), bar: new Date(2018, 5, 29) }, html => html), '')

  template = await compile('<if foo is not after bar>baz</if>')
  assert.deepEqual(template({ foo: new Date(2018, 5, 27), bar: new Date(2018, 5, 29) }, html => html), 'baz')

  template = await compile('<if foo is a digit>baz</if>')
  assert.deepEqual(template({ foo: 0 }, html => html), 'baz')

  template = await compile('<if foo is a digit>baz</if>')
  assert.deepEqual(template({ foo: 7 }, html => html), 'baz')

  template = await compile('<if foo is a digit>baz</if>')
  assert.deepEqual(template({ foo: 10 }, html => html), '')

  template = await compile('<if foo is not a digit>baz</if>')
  assert.deepEqual(template({ foo: 10 }, html => html), 'baz')

  template = await compile('<if foo is decimal>baz</if>')
  assert.deepEqual(template({ foo: 2.91 }, html => html), 'baz')

  template = await compile('<if foo is decimal>baz</if>')
  assert.deepEqual(template({ foo: 2.11 }, html => html), 'baz')

  template = await compile('<if foo is decimal>baz</if>')
  assert.deepEqual(template({ foo: 2.00 }, html => html), '')

  template = await compile('<if foo is decimal>baz</if>')
  assert.deepEqual(template({ foo: 1 }, html => html), '')

  template = await compile('<if foo is not decimal>baz</if>')
  assert.deepEqual(template({ foo: 1 }, html => html), 'baz')

  template = await compile('<if foo is frozen>baz</if>')
  assert.deepEqual(template({ foo: Object.freeze({}) }, html => html), 'baz')

  template = await compile('<if foo is frozen>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), '')

  template = await compile('<if foo is not frozen>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), 'baz')

  template = await compile('<if foo is sealed>baz</if>')
  assert.deepEqual(template({ foo: Object.seal({}) }, html => html), 'baz')

  template = await compile('<if foo is sealed>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), '')

  template = await compile('<if foo is not sealed>baz</if>')
  assert.deepEqual(template({ foo: {} }, html => html), 'baz')

  template = await compile('<if foo eq="bar">baz</if>')
  assert.deepEqual(template({ foo: 'bar' }, html => html), 'baz')

  template = await compile('<if foo eq="bar">baz</if>')
  assert.deepEqual(template({ foo: 'baz' }, html => html), '')

  template = await compile('<if foo eq="{bar}">baz</if>')
  assert.deepEqual(template({ foo: 'qux', bar: 'qux' }, html => html), 'baz')

  template = await compile('<if foo eq="{bar}">baz</if>')
  assert.deepEqual(template({ foo: 'qux', bar: 'quuux' }, html => html), '')

  template = await compile('<if foo eq="{bar}">baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 10 }, html => html), 'baz')

  template = await compile('<if foo eq="{bar}">baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 0 }, html => html), '')

  template = await compile('<if foo eq="{bar}">baz</if>')
  assert.deepEqual(template({ foo: null, bar: null }, html => html), 'baz')

  template = await compile('<if foo eq="{bar}">baz</if>')
  assert.deepEqual(template({ foo: {}, bar: {} }, html => html), '')

  template = await compile('<if foo eq="{10}">baz</if>')
  assert.deepEqual(template({ foo: 10 }, html => html), 'baz')

  template = await compile('<if foo eq="{100 + 100}">baz</if>')
  assert.deepEqual(template({ foo: 200 }, html => html), 'baz')

  template = await compile('<if foo eq="{100 + 100 + 0}">baz</if>')
  assert.deepEqual(template({ foo: 200 }, html => html), 'baz')

  template = await compile('<if foo eq="{bar}">baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 10 }, html => html), 'baz')

  template = await compile('<if foo eq="{bar}">baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 100 }, html => html), '')

  template = await compile('<if foo starts with bar>baz</if>')
  assert.deepEqual(template({ foo: 'ban qux', bar: 'ban' }, html => html), 'baz')

  template = await compile('<if foo starts with bar>baz</if>')
  assert.deepEqual(template({ foo: 'ban qux', bar: 'qux' }, html => html), '')

  template = await compile('<if foo does not start with bar>baz</if>')
  assert.deepEqual(template({ foo: 'ban qux', bar: 'qux' }, html => html), 'baz')

  template = await compile('<if foo ends with bar>baz</if>')
  assert.deepEqual(template({ foo: 'ban qux', bar: 'qux' }, html => html), 'baz')

  template = await compile('<if foo ends with bar>baz</if>')
  assert.deepEqual(template({ foo: 'ban qux', bar: 'ban' }, html => html), '')

  template = await compile('<if foo does not end with bar>baz</if>')
  assert.deepEqual(template({ foo: 'ban qux', bar: 'ban' }, html => html), 'baz')

  template = await compile('<if foo and bar and baz>qux</if>')
  assert.deepEqual(template({ foo: true, bar: true, baz: true }, html => html), 'qux')

  template = await compile('<if foo and bar and baz>qux</if>')
  assert.deepEqual(template({ foo: false, bar: true, baz: true }, html => html), '')

  template = await compile('<if foo and bar and baz>qux</if>')
  assert.deepEqual(template({ foo: true, bar: true, baz: false }, html => html), '')

  template = await compile('<if foo and bar and baz>qux</if>')
  assert.deepEqual(template({ foo: false, bar: true, baz: false }, html => html), '')

  template = await compile('<if foo and bar and baz and ban>qux</if>')
  assert.deepEqual(template({ foo: true, bar: true, baz: true, ban: true }, html => html), 'qux')

  template = await compile('<if foo and bar and baz and ban>qux</if>')
  assert.deepEqual(template({ foo: false, bar: true, baz: true, ban: true }, html => html), '')

  template = await compile('<if foo and bar and baz and ban>qux</if>')
  assert.deepEqual(template({ foo: false, bar: false, baz: false, ban: false }, html => html), '')

  template = await compile('<if foo and bar and baz and ban>qux</if>')
  assert.deepEqual(template({ foo: true, bar: true, baz: true, ban: false }, html => html), '')

  template = await compile('<if foo and bar equals baz>qux</if>')
  assert.deepEqual(template({ foo: true, bar: 'baz', baz: 'baz' }, html => html), 'qux')

  template = await compile('<if foo and bar equals baz>qux</if>')
  assert.deepEqual(template({ foo: false, bar: 'baz', baz: 'baz' }, html => html), '')

  template = await compile('<if foo and bar equals baz>qux</if>')
  assert.deepEqual(template({ foo: true, bar: 'baz', baz: 'ban' }, html => html), '')

  template = await compile('<if foo and bar equals="baz">qux</if>')
  assert.deepEqual(template({ foo: true, bar: 'baz' }, html => html), 'qux')

  template = await compile('<if foo and bar equals="{baz}">qux</if>')
  assert.deepEqual(template({ foo: true, bar: 'baz', baz: 'baz' }, html => html), 'qux')

  template = await compile('<if foo is divisible by three and foo is divisible by five>bar</if>')
  assert.deepEqual(template({ foo: 15 }, html => html), 'bar')

  template = await compile('<if foo is divisible by three and foo is divisible by five>bar</if>')
  assert.deepEqual(template({ foo: 14 }, html => html), '')

  template = await compile('<if foo is divisible by three and foo is divisible by four>bar</if>')
  assert.deepEqual(template({ foo: 12 }, html => html), 'bar')

  template = await compile('<if foo is divisible by two and foo is divisible by five>bar</if>')
  assert.deepEqual(template({ foo: 10 }, html => html), 'bar')

  template = await compile('<if foo is divisible by three and foo is divisible by five>bar</if>')
  assert.deepEqual(template({ foo: 8 }, html => html), '')

  template = await compile('<if foo includes bar>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum', bar: 'ipsum' }, html => html), 'baz')

  template = await compile('<if foo includes bar>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum', bar: 'dolor' }, html => html), '')

  template = await compile('<if foo includes bar>baz</if>')
  assert.deepEqual(template({ foo: ['lorem', 'ipsum'], bar: 'ipsum' }, html => html), 'baz')

  template = await compile('<if foo includes bar>baz</if>')
  assert.deepEqual(template({ foo: ['lorem', 'ipsum'], bar: 'dolor' }, html => html), '')

  template = await compile('<if foo does not include={"dolor"}>baz</if>')
  assert.deepEqual(template({ foo: ['lorem', 'ipsum'] }, html => html), 'baz')

  template = await compile('<if foo contains={"ipsum"}>baz</if>')
  assert.deepEqual(template({ foo: ['lorem', 'ipsum'] }, html => html), 'baz')

  template = await compile('<if foo contains={"dolor"}>baz</if>')
  assert.deepEqual(template({ foo: ['lorem', 'ipsum'] }, html => html), '')

  template = await compile('<if foo does not contain={"dolor"}>baz</if>')
  assert.deepEqual(template({ foo: ['lorem', 'ipsum'] }, html => html), 'baz')

  template = await compile('<if foo contains={"ipsum"}>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum' }, html => html), 'baz')

  template = await compile('<if foo contains={"dolor"}>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum' }, html => html), '')

  template = await compile('<if foo matches bar>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum', bar: /ipsum/ }, html => html), 'baz')

  template = await compile('<if foo matches bar>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum', bar: /dolor/ }, html => html), '')

  template = await compile('<if foo does not match bar>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum', bar: /dolor/ }, html => html), 'baz')

  template = await compile('<if not foo and bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: true }, html => html), 'baz')

  template = await compile('<if not foo and bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: false }, html => html), '')

  template = await compile('<if not foo and bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: false }, html => html), '')

  template = await compile('<if not foo and bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: true }, html => html), '')

  template = await compile('<if foo is positive and bar>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: true }, html => html), 'baz')

  template = await compile('<if foo is positive and bar>baz</if>')
  assert.deepEqual(template({ foo: -10, bar: true }, html => html), '')

  template = await compile('<if foo is positive and bar>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: false }, html => html), '')

  template = await compile('<if foo is positive and bar>baz</if>')
  assert.deepEqual(template({ foo: -10, bar: false }, html => html), '')

  template = await compile('<if foo is not positive and bar>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: true }, html => html), '')

  template = await compile('<if foo is not positive and bar>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: true }, html => html), '')

  template = await compile('<if foo is not positive and bar>baz</if>')
  assert.deepEqual(template({ foo: -10, bar: true }, html => html), 'baz')

  template = await compile('<if foo is not positive and bar>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: false }, html => html), '')

  template = await compile('<if foo is not positive and bar>baz</if>')
  assert.deepEqual(template({ foo: -10, bar: false }, html => html), '')

  template = await compile('<if foo is not positive and not bar>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: true }, html => html), '')

  template = await compile('<if foo is not positive and not bar>baz</if>')
  assert.deepEqual(template({ foo: -10, bar: true }, html => html), '')

  template = await compile('<if foo is not positive and not bar>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: false }, html => html), '')

  template = await compile('<if foo is not positive and not bar>baz</if>')
  assert.deepEqual(template({ foo: -10, bar: false }, html => html), 'baz')

  template = await compile('<if foo and not bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: true }, html => html), '')

  template = await compile('<if foo and not bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: false }, html => html), 'baz')

  template = await compile('<if foo and not bar>baz</if>')
  assert.deepEqual(template({ foo: false, bar: false }, html => html), '')

  template = await compile('<if foo and not bar>baz</if>')
  assert.deepEqual(template({ foo: true, bar: true }, html => html), '')

  template = await compile('<if foo responds to={"bar"}>baz</if>')
  assert.deepEqual(template({ foo: { bar () {} } }, html => html), 'baz')

  template = await compile('<if foo responds bar>baz</if>')
  assert.deepEqual(template({ foo: { bar () {} }, bar: 'bar' }, html => html), 'baz')

  template = await compile('<if foo responds bar>baz</if>')
  assert.deepEqual(template({ foo: { bar: [] }, bar: 'bar' }, html => html), 'baz')

  template = await compile('<if foo does not respond to bar>baz</if>')
  assert.deepEqual(template({ foo: { bar: [] }, bar: 'bar' }, html => html), 'baz')

  template = await compile('<if foo bitwise and bar or baz>baz</if>')
  assert.deepEqual(template({ foo: 1, bar: 1, baz: 0 }, html => html), 'baz')

  template = await compile('<if foo bitwise and bar or baz>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 0, baz: 0 }, html => html), '')

  template = await compile('<if foo is an email>baz</if>')
  assert.deepEqual(template({ foo: 'as@ts.eu' }, html => html), 'baz')

  template = await compile('<if foo is an email>baz</if>')
  assert.deepEqual(template({ foo: 'asts.eu' }, html => html), '')

  template = await compile('<if foo have more than one element>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5] }, html => html), 'baz')

  template = await compile('<if foo have more than four item>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5] }, html => html), 'baz')

  template = await compile('<if photos have more than two photo>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, html => html), '')

  template = await compile('<if photos do not have more than two photo>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, html => html), 'baz')

  template = await compile('<if foo have less than six element>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5] }, html => html), 'baz')

  template = await compile('<if photos have less than two photo>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, html => html), '')

  template = await compile('<if photos do not have less than two photo>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, html => html), 'baz')

  template = await compile('<if photos have two photo>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, html => html), 'baz')

  template = await compile('<if photos have zero photo>baz</if>')
  assert.deepEqual(template({ photos: [] }, html => html), 'baz')

  template = await compile('<if photos have one photo>baz</if>')
  assert.deepEqual(template({ photos: [] }, html => html), '')

  template = await compile('<if photos do not have one photo>baz</if>')
  assert.deepEqual(template({ photos: [] }, html => html), 'baz')

  template = await compile('<if photos have many pictures>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, html => html), 'baz')

  template = await compile('<if photos have many pictures>baz</if>')
  assert.deepEqual(template({ photos: [{}] }, html => html), '')

  template = await compile('<if photos have many pictures>baz</if>')
  assert.deepEqual(template({ photos: [{}] }, html => html), '')

  template = await compile('<if photos do not have many pictures>baz</if>')
  assert.deepEqual(template({ photos: [{}] }, html => html), 'baz')

  template = await compile('<if photos have elements>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, html => html), 'baz')

  template = await compile('<if photos have elements>baz</if>')
  assert.deepEqual(template({ photos: [{}] }, html => html), 'baz')

  template = await compile('<if photos have elements>baz</if>')
  assert.deepEqual(template({ photos: [] }, html => html), '')

  template = await compile('<if photos do not have elements>baz</if>')
  assert.deepEqual(template({ photos: [] }, html => html), 'baz')

  template = await compile('<if foo has more than one element>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5] }, html => html), 'baz')

  template = await compile('<if foo has more than four item>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5] }, html => html), 'baz')

  template = await compile('<if foo has more than four item>baz</if>')
  assert.deepEqual(template({ foo: [{}, {}] }, html => html), '')

  template = await compile('<if photos has more than two picture>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, html => html), '')

  template = await compile('<if photos does not have more than two picture>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, html => html), 'baz')

  template = await compile('<if foo has less than six element>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5] }, html => html), 'baz')

  template = await compile('<if photos has less than two item>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, html => html), '')

  template = await compile('<if photos does not have less than two item>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, html => html), 'baz')

  template = await compile('<if photos has two element>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, html => html), 'baz')

  template = await compile('<if photos has zero item>baz</if>')
  assert.deepEqual(template({ photos: [] }, html => html), 'baz')

  template = await compile('<if photos has one picture>baz</if>')
  assert.deepEqual(template({ photos: [] }, html => html), '')

  template = await compile('<if photos does not have one element>baz</if>')
  assert.deepEqual(template({ photos: [] }, html => html), 'baz')

  template = await compile('<if photos has many pictures>baz</if>')
  assert.deepEqual(template({ photos: [{}, {}] }, html => html), 'baz')

  template = await compile('<if photos has many pictures>baz</if>')
  assert.deepEqual(template({ photos: [{}] }, html => html), '')

  template = await compile('<if photos does not have many pictures>baz</if>')
  assert.deepEqual(template({ photos: [{}] }, html => html), 'baz')

  template = await compile('<if foo has items>baz</if>')
  assert.deepEqual(template({ foo: [{}, {}] }, html => html), 'baz')

  template = await compile('<if foo has items>baz</if>')
  assert.deepEqual(template({ foo: [{}] }, html => html), 'baz')

  template = await compile('<if foo has items>baz</if>')
  assert.deepEqual(template({ foo: [] }, html => html), '')

  template = await compile('<if foo does not have items>baz</if>')
  assert.deepEqual(template({ foo: [] }, html => html), 'baz')

  template = await compile('<if foo is between bar and baz>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 10, baz: 20 }, html => html), 'baz')

  template = await compile('<if foo is between bar and baz>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 10, baz: 20 }, html => html), 'baz')

  template = await compile('<if foo is between bar and baz>baz</if>')
  assert.deepEqual(template({ foo: 15, bar: 10, baz: 20 }, html => html), 'baz')

  template = await compile('<if foo is between bar and baz>baz</if>')
  assert.deepEqual(template({ foo: 20, bar: 10, baz: 20 }, html => html), 'baz')

  template = await compile('<if foo is between bar and baz>baz</if>')
  assert.deepEqual(template({ foo: 50, bar: 10, baz: 20 }, html => html), '')

  template = await compile('<if foo is between bar and baz>baz</if>')
  assert.deepEqual(template({ foo: 50, bar: 10, baz: 20 }, html => html), '')

  template = await compile('<if foo is between one and ten>baz</if>')
  assert.deepEqual(template({ foo: 10 }, html => html), 'baz')

  template = await compile('<if foo is between six and nine>baz</if>')
  assert.deepEqual(template({ foo: 5 }, html => html), '')

  template = await compile('<if foo is not between six and nine>baz</if>')
  assert.deepEqual(template({ foo: 5 }, html => html), 'baz')

  template = await compile('<if foo is between bar and baz and qux>baz</if>')
  assert.deepEqual(template({ foo: 15, bar: 10, baz: 20, qux: true }, html => html), 'baz')

  template = await compile('<if foo is between bar and baz and qux>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 10, baz: 20, qux: false }, html => html), '')

  template = await compile('<if foo is not between bar and baz and qux>baz</if>')
  assert.deepEqual(template({ foo: 0, bar: 10, baz: 20, qux: true }, html => html), 'baz')

  template = await compile('<if foo is below bar>baz</if>')
  assert.deepEqual(template({ foo: 5, bar: 10 }, html => html), 'baz')

  template = await compile('<if foo is below bar>baz</if>')
  assert.deepEqual(template({ foo: 20, bar: 20 }, html => html), '')

  template = await compile('<if foo is below six>baz</if>')
  assert.deepEqual(template({ foo: 5 }, html => html), 'baz')

  template = await compile('<if foo is below three>baz</if>')
  assert.deepEqual(template({ foo: 5 }, html => html), '')

  template = await compile('<if foo is not below three>baz</if>')
  assert.deepEqual(template({ foo: 5 }, html => html), 'baz')

  template = await compile('<if foo is not below three>baz</if>')
  assert.deepEqual(template({ foo: 5 }, html => html), 'baz')

  template = await compile('<if foo is above bar>baz</if>')
  assert.deepEqual(template({ foo: 15, bar: 10 }, html => html), 'baz')

  template = await compile('<if foo is above bar>baz</if>')
  assert.deepEqual(template({ foo: 20, bar: 20 }, html => html), '')

  template = await compile('<if foo is above six>baz</if>')
  assert.deepEqual(template({ foo: 15 }, html => html), 'baz')

  template = await compile('<if foo is above nine>baz</if>')
  assert.deepEqual(template({ foo: 5 }, html => html), '')

  template = await compile('<if foo is not above nine>baz</if>')
  assert.deepEqual(template({ foo: 5 }, html => html), 'baz')

  template = await compile('<if foo is not above three>baz</if>')
  assert.deepEqual(template({ foo: 5 }, html => html), '')

  template = await compile('<if foo is at least bar>baz</if>')
  assert.deepEqual(template({ foo: 20, bar: 20 }, html => html), 'baz')

  template = await compile('<if foo is at least four>baz</if>')
  assert.deepEqual(template({ foo: 5 }, html => html), 'baz')

  template = await compile('<if foo is at least bar>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 20 }, html => html), '')

  template = await compile('<if foo is at least eight>baz</if>')
  assert.deepEqual(template({ foo: 5 }, html => html), '')

  template = await compile('<if foo is not at least bar>baz</if>')
  assert.deepEqual(template({ foo: 10, bar: 20 }, html => html), 'baz')

  template = await compile('<if foo is not at least eight>baz</if>')
  assert.deepEqual(template({ foo: 5 }, html => html), 'baz')

  template = await compile('<if foo is at most bar>baz</if>')
  assert.deepEqual(template({ foo: 20, bar: 20 }, html => html), 'baz')

  template = await compile('<if foo is at most bar>baz</if>')
  assert.deepEqual(template({ foo: 30, bar: 20 }, html => html), '')

  template = await compile('<if foo is not at most bar>baz</if>')
  assert.deepEqual(template({ foo: 30, bar: 20 }, html => html), 'baz')

  template = await compile('<if foo is at most eight>baz</if>')
  assert.deepEqual(template({ foo: 6 }, html => html), 'baz')

  template = await compile('<if foo is at most eight>baz</if>')
  assert.deepEqual(template({ foo: 20 }, html => html), '')

  template = await compile('<if foo is not at most eight>baz</if>')
  assert.deepEqual(template({ foo: 10 }, html => html), 'baz')

  template = await compile('<if foo has length of bar>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 5 }, html => html), 'baz')

  template = await compile('<if foo has length of bar>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 10 }, html => html), '')

  template = await compile('<if foo does not have length of bar>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 10 }, html => html), 'baz')

  template = await compile('<if foo has length of five>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 10 }, html => html), 'baz')

  template = await compile('<if foo has length of six>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 10 }, html => html), '')

  template = await compile('<if foo has length of at least bar>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 5 }, html => html), 'baz')

  template = await compile('<if foo has length of at least bar>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 10 }, html => html), '')

  template = await compile('<if foo does not have length of at least bar>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 10 }, html => html), 'baz')

  template = await compile('<if foo has length of at least five>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum', bar: 5 }, html => html), 'baz')

  template = await compile('<if foo has length of at least bar>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum', bar: 100 }, html => html), '')

  template = await compile('<if foo has length of at most bar>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 5 }, html => html), 'baz')

  template = await compile('<if foo has length of at most bar>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 1 }, html => html), '')

  template = await compile('<if foo does not have length of at most bar>baz</if>')
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5], bar: 1 }, html => html), 'baz')

  template = await compile('<if foo has length of at most five>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum', bar: 5 }, html => html), '')

  template = await compile('<if foo does not have length of at most bar>baz</if>')
  assert.deepEqual(template({ foo: 'lorem ipsum', bar: 5 }, html => html), 'baz')

  template = await compile('<if foo is different than bar>baz</if>')
  assert.deepEqual(template({ foo: 5, bar: 1 }, html => html), 'baz')

  template = await compile('<if foo is different than bar>baz</if>')
  assert.deepEqual(template({ foo: 'lorem', bar: 'ipsum' }, html => html), 'baz')

  template = await compile('<if foo is different than bar>baz</if>')
  assert.deepEqual(template({ foo: 5, bar: 5 }, html => html), '')

  template = await compile('<if foo is different than bar>baz</if>')
  assert.deepEqual(template({ foo: 'lorem', bar: 'lorem' }, html => html), '')

  template = await compile('<if foo is in bar>baz</if>')
  assert.deepEqual(template({ foo: 5, bar: [1, 2, 3, 4] }, html => html), '')

  template = await compile('<if foo is in bar>baz</if>')
  assert.deepEqual(template({ foo: 4, bar: [1, 2, 3, 4] }, html => html), 'baz')

  template = await compile('<if foo is in bar>baz</if>')
  assert.deepEqual(template({ foo: '5', bar: '1234' }, html => html), '')

  template = await compile('<if foo is in bar>baz</if>')
  assert.deepEqual(template({ foo: '4', bar: '1234' }, html => html), 'baz')

  template = await compile('<if foo is a url><a href="{foo}">{bar}</a></if>')
  assert.deepEqual(template({ foo: 'https://buxlabs.pl/narzędzia/js', bar: 'click me' }, html => html), '<a href="https://buxlabs.pl/narzędzia/js">click me</a>')

  template = await compile('<if foo is a url><a href="{foo}">{bar}</a></if>')
  assert.deepEqual(template({ foo: '' }, html => html), '')

  template = await compile('<if foo>bar</if><else>baz<if qux>quux</if></else>')
  assert.deepEqual(template({ foo: false, qux: false }, html => html), 'baz')

  template = await compile('<if foo>bar</if><else>baz<if qux>quux</if></else>')
  assert.deepEqual(template({ foo: true, qux: true }, html => html), 'bar')

  template = await compile('<if foo>bar</if><else>baz<if qux>quux</if></else>')
  assert.deepEqual(template({ foo: false, qux: true }, html => html), 'bazquux')

  template = await compile('<if foo>bar</if><elseif bar>baz<if qux>quux</if></elseif>')
  assert.deepEqual(template({ foo: true, bar: true, qux: true }, html => html), 'bar')

  template = await compile('<if foo>bar</if><elseif bar>baz<if qux>quux</if></elseif>')
  assert.deepEqual(template({ foo: false, bar: false, qux: false }, html => html), '')

  template = await compile('<if foo>bar</if><else>baz<if qux>quux</if></else>')
  assert.deepEqual(template({ foo: true, bar: false, qux: false }, html => html), 'bar')

  template = await compile('<if foo>bar</if><elseif bar>baz<if qux>quux</if></elseif>')
  assert.deepEqual(template({ foo: false, bar: true, qux: false }, html => html), 'baz')

  template = await compile('<if foo>bar</if><elseif bar>baz<if qux>quux</if></elseif>')
  assert.deepEqual(template({ foo: false, bar: false, qux: true }, html => html), '')

  template = await compile('<if foo>bar</if><elseif bar>baz<if qux>quux</if></elseif>')
  assert.deepEqual(template({ foo: true, bar: true, qux: false }, html => html), 'bar')

  template = await compile('<if foo>bar</if><elseif bar>baz<if qux>quux</if></elseif>')
  assert.deepEqual(template({ foo: true, bar: false, qux: true }, html => html), 'bar')

  template = await compile('<if foo>foo</if><elseif bar>bar</elseif><else><if baz>baz</if><else>ban</else></else>')
  assert.deepEqual(template({ foo: true, bar: true, baz: true }, html => html), 'foo')

  template = await compile('<if foo>foo</if><elseif bar>bar</elseif><else><if baz>baz</if><else>ban</else></else>')
  assert.deepEqual(template({ foo: false, bar: false, baz: true }, html => html), 'baz')

  template = await compile('<if foo>foo</if><elseif bar>bar</elseif><else><if baz>baz</if><else>ban</else></else>')
  assert.deepEqual(template({ foo: false, bar: false, baz: false }, html => html), 'ban')

  template = await compile('<if foo>foo</if><elseif bar>bar</elseif><else><if baz>baz</if><else>ban</else></else>')
  assert.deepEqual(template({ foo: false, bar: true, baz: true }, html => html), 'bar')

  template = await compile('<if foo>foo</if><elseif bar>bar</elseif><else><if baz>baz</if><else>ban</else></else>')
  assert.deepEqual(template({ foo: false, bar: false, baz: true }, html => html), 'baz')

  template = await compile('<if foo>foo</if><elseif bar>bar</elseif><else><if baz>baz</if><else>ban</else></else>')
  assert.deepEqual(template({ foo: true, bar: false, baz: true }, html => html), 'foo')

  template = await compile('<if foo>bar</if><elseunless bar>baz</elseunless>')
  assert.deepEqual(template({ foo: false, bar: false }, html => html), 'baz')

  template = await compile('<if foo>bar</if><else>baz</else>')
  assert.deepEqual(template({ foo: true }, html => html), 'bar')

  template = await compile('<if foo>bar</if><else>baz</else>')
  assert.deepEqual(template({ foo: false }, html => html), 'baz')

  template = await compile('<if foo>bar</if><elseif bar>baz</else>')
  assert.deepEqual(template({ foo: true, bar: false }, html => html), 'bar')

  template = await compile('<if foo>bar</if><elseif bar>baz</else>')
  assert.deepEqual(template({ foo: false, bar: true }, html => html), 'baz')
})
