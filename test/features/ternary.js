const { equal } = require('assert')
const compile = require('../helpers/compile')

console.time('ternary')

equal(compile('{foo ? "bar" : "baz"}')({ foo: true }, html => html), 'bar')
equal(compile('{foo ? "bar" : "baz"}')({ foo: false }, html => html), 'baz')
equal(compile('{foo ? bar : baz}')({ foo: true, bar: 'bar', baz: 'baz' }, html => html), 'bar')
equal(compile('{foo ? bar : baz}')({ foo: false, bar: 'bar', baz: 'baz' }, html => html), 'baz')
equal(compile('{foo.bar ? bar : baz}')({ foo: { bar: true }, bar: 'bar', baz: 'baz' }, html => html), 'bar')
equal(compile('{foo.bar ? bar : baz}')({ foo: { bar: false }, bar: 'bar', baz: 'baz' }, html => html), 'baz')
equal(compile('{foo.bar ? bar.baz : baz.qux}')({ foo: { bar: true }, bar: { baz: 'bar' }, baz: { qux: 'baz' } }, html => html), 'bar')
equal(compile('{foo.bar ? bar.baz : baz.qux}')({ foo: { bar: false }, bar: { baz: 'bar' }, baz: { qux: 'baz' } }, html => html), 'baz')
// TODO {foo[bar] ? ...}
console.timeEnd('ternary')
