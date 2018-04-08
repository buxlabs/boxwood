const assert = require('assert')
const { compile } = require('.')

assert.deepEqual(compile('hello world')(), 'hello world')
assert.deepEqual(compile('<div></div>')(), '<div></div>')
assert.deepEqual(compile('<div>foo</div>')(), '<div>foo</div>')

assert.deepEqual(compile('<input>')(), '<input>')
assert.deepEqual(compile('<input type="number" value="100">')(), '<input type="number" value="100">')
assert.deepEqual(compile('<input    value="100">')(), '<input value="100">')

assert.deepEqual(compile('<slot html="foo"/>')(), 'foo')
assert.deepEqual(compile('<slot text="foo"/>')({}, html => html.replace('foo', 'bar')), 'bar')

assert.deepEqual(compile('<slot html="foo"></slot>')(), 'foo')
assert.deepEqual(compile('<slot text="foo"></slot>')({}, html => html.replace('foo', 'bar')), 'bar')

assert.deepEqual(compile('<slot html="{foo}"/>')({ foo: 'bar' }), 'bar')
assert.deepEqual(compile('<slot text="{foo}"/>')({ foo: 'bar' }, html => html.replace('bar', 'foo')), 'foo')

assert.deepEqual(compile('<slot html="{foo}"></slot>')({ foo: 'bar' }), 'bar')
assert.deepEqual(compile('<slot text="{foo}"></slot>')({ foo: 'bar' }, html => html.replace('bar', 'foo')), 'foo')

assert.deepEqual(compile('<slot html.bind="foo"></slot>')({ foo: 'bar' }), 'bar')
assert.deepEqual(compile('<slot text.bind="foo"></slot>')({ foo: 'bar' }, html => html.replace('bar', 'foo')), 'foo')

assert.deepEqual(compile('<div html="foo"></div>')(), '<div>foo</div>')
assert.deepEqual(compile('<div text="foo"></div>')({}, html => html.replace('foo', 'bar')), '<div>bar</div>')

assert.deepEqual(compile('<div class="foo" html="{bar}"></div>')({ bar: 'baz' }), '<div class="foo">baz</div>')
assert.deepEqual(compile('<div class="foo" text="{bar}"></div>')({ bar: 'baz' }, value => { return value }), '<div class="foo">baz</div>')

assert.deepEqual(compile('<div class="{foo}"></div>')({ foo: 'bar' }), '<div class="bar"></div>')
assert.deepEqual(compile('<div class.bind="foo"></div>')({ foo: 'bar' }), '<div class="bar"></div>')

assert.deepEqual(compile('<div></div>')(), '<div></div>')

assert.deepEqual(compile('<div html="{foo}"></div>')({ foo: 'bar' }), '<div>bar</div>')
assert.deepEqual(compile('<div html="foo"></div>')({}), '<div>foo</div>')
assert.deepEqual(compile('<div html="foo"></div>')(), '<div>foo</div>')
assert.deepEqual(compile('<div html="{foo}">xxx</div>')({ foo: 'bar' }), '<div>barxxx</div>')
assert.deepEqual(compile('<div html="{foo}"></div>')({ foo: '<div>baz</div>' }), '<div><div>baz</div></div>')
assert.deepEqual(compile('<div text="{foo}"></div>')({ foo: 'bar' }, html => html.replace('foo', 'bar')), '<div>bar</div>')

assert.deepEqual(compile('<input type="text" value="{foo.bar}">')({ foo: { bar: 'baz' } }), '<input type="text" value="baz">')
assert.deepEqual(compile('<input type="text" value.bind="foo.bar">')({ foo: { bar: 'baz' } }), '<input type="text" value="baz">')
