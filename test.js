const assert = require('assert')
const { render, compile } = require('.')

assert.deepEqual(compile('hello world')(), 'hello world')
assert.deepEqual(compile('<div></div>')(), '<div></div>')
assert.deepEqual(compile('<div>foo</div>')(), '<div>foo</div>')

assert.deepEqual(compile('<input>')(), '<input>')
assert.deepEqual(compile('<input type="number" value="100">')(), '<input type="number" value="100">')
assert.deepEqual(compile('<input    value="100">')(), '<input value="100">')

assert.deepEqual(compile('<slot text="foo"/>')(), 'foo')
assert.deepEqual(compile('<slot html="foo"/>')({}, html => html.replace('foo', 'bar')), 'bar')

assert.deepEqual(compile('<slot text="foo"></slot>')(), 'foo')
assert.deepEqual(compile('<slot html="foo"></slot>')({}, html => html.replace('foo', 'bar')), 'bar')

assert.deepEqual(compile('<slot text="${foo}"/>')({ foo: 'bar' }), 'bar')
assert.deepEqual(compile('<slot html="${foo}"/>')({ foo: 'bar' }, html => html.replace('bar', 'foo')), 'foo')

assert.deepEqual(compile('<slot text="${foo}"></slot>')({ foo: 'bar' }), 'bar')
assert.deepEqual(compile('<slot html="${foo}"></slot>')({ foo: 'bar' }, html => html.replace('bar', 'foo')), 'foo')

assert.deepEqual(compile('<div text="foo"></div>')(), '<div>foo</div>')
assert.deepEqual(compile('<div html="foo"></div>')({}, html => html.replace('foo', 'bar')), '<div>bar</div>')

