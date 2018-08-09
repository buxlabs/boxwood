const { equal } = require('assert')
const compile = require('../helpers/compile')

console.time('globals')

equal(compile('{Math.abs(foo)}')({ foo: -1 }, html => html), '1')
equal(compile('{Math.ceil(foo)}')({ foo: 1.6 }, html => html), '2')
equal(compile('{Math.floor(foo)}')({ foo: 1.6 }, html => html), '1')
equal(compile('{Math.round(foo)}')({ foo: 1.4 }, html => html), '1')
equal(compile('{Math.round(foo)}')({ foo: 1.6 }, html => html), '2')
equal(compile('{Math.pow(foo, 3)}')({ foo: 2 }, html => html), '8')

equal(compile('{Number.isFinite(foo)}')({ foo: 42 }, html => html), 'true')
equal(compile('{Number.isFinite(foo)}')({ foo: Infinity }, html => html), 'false')

equal(compile('{JSON.stringify(foo, null, 2)}')({ foo: { bar: 'baz' } }, html => html), '{\n  "bar": "baz"\n}')
equal(compile('{JSON.stringify(foo, null, 4)}')({ foo: { bar: 'baz' } }, html => html), '{\n    "bar": "baz"\n}')

equal(compile('{Date.parse("01 Jan 1970 00:00:00 GMT")}')({}, html => html), '0')
equal(compile('{Date.parse("04 Dec 1995 00:12:00 GMT")}')({}, html => html), '818035920000')

console.timeEnd('globals')
