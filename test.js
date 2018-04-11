const assert = require('assert')
const { compile } = require('.')

assert.deepEqual(compile('hello world')(), 'hello world')
assert.deepEqual(compile('<div></div>')(), '<div></div>')
assert.deepEqual(compile('<div>foo</div>')(), '<div>foo</div>')
assert.deepEqual(compile('<input>')(), '<input>')
assert.deepEqual(compile('<input/>')(), '<input>')
assert.deepEqual(compile('<input type="number" value="100">')(), '<input type="number" value="100">')
assert.deepEqual(compile('<input    value="100">')(), '<input value="100">')
assert.deepEqual(compile('<slot html="foo"/>')(), 'foo')
assert.deepEqual(compile('<slot text="foo"/>')({}, html => html.replace('foo', 'bar')), 'bar')
assert.deepEqual(compile('<slot html="foo"></slot>')(), 'foo')
assert.deepEqual(compile('<slot text="foo"></slot>')({}, html => html.replace('foo', 'bar')), 'bar')
assert.deepEqual(compile('<slot html="{foo}"/>')({ foo: 'bar' }), 'bar')
assert.deepEqual(compile('<slot html={foo} />')({ foo: 'bar' }), 'bar')
assert.deepEqual(compile('<slot text="{foo}"/>')({ foo: 'bar' }, html => html.replace('bar', 'foo')), 'foo')
assert.deepEqual(compile('<slot html="{foo}"></slot>')({ foo: 'bar' }), 'bar')
assert.deepEqual(compile('<slot html="{foo} bar"></slot>')({ foo: 'baz' }), 'baz bar')
assert.deepEqual(compile('<slot html="foo {bar}"></slot>')({ bar: 'baz' }), 'foo baz')
assert.deepEqual(compile('<slot html="foo {bar} baz"></slot>')({ bar: 'qux' }), 'foo qux baz')
assert.deepEqual(compile('<slot html="foo    {bar}    baz"></slot>')({ bar: 'qux' }), 'foo qux baz')
assert.deepEqual(compile('<slot html="  foo {bar} baz  "></slot>')({ bar: 'qux' }), 'foo qux baz')
assert.deepEqual(compile('<slot text="{foo}"></slot>')({ foo: 'bar' }, html => html.replace('bar', 'foo')), 'foo')
assert.deepEqual(compile('<slot text={foo}></slot>')({ foo: 'bar' }, html => html.replace('bar', 'foo')), 'foo')
assert.deepEqual(compile('<slot text="{foo} baz"></slot>')({ foo: 'bar' }, html => html.replace('bar', 'foo')), 'foo baz')
assert.deepEqual(compile('<slot text="foo {bar}"></slot>')({ bar: 'baz' }, html => html.replace('bar', 'foo')), 'foo baz')
assert.deepEqual(compile('<slot html.bind="foo"></slot>')({ foo: 'bar' }), 'bar')
assert.deepEqual(compile('<slot text.bind="foo"></slot>')({ foo: 'bar' }, html => html.replace('bar', 'foo')), 'foo')
assert.deepEqual(compile('<div html="foo"></div>')(), '<div>foo</div>')
assert.deepEqual(compile('<div text="foo"></div>')({}, html => html.replace('foo', 'bar')), '<div>bar</div>')
assert.deepEqual(compile('<div class="foo" html="{bar}"></div>')({ bar: 'baz' }), '<div class="foo">baz</div>')
assert.deepEqual(compile('<div class="foo" text="{bar}"></div>')({ bar: 'baz' }, value => { return value }), '<div class="foo">baz</div>')
assert.deepEqual(compile('<div class="foo {bar}"></div>')({ bar: 'baz' }, value => { return value }), '<div class="foo baz"></div>')
assert.deepEqual(compile('<div class="foo bar {baz}"></div>')({ baz: 'qux' }, value => { return value }), '<div class="foo bar qux"></div>')
assert.deepEqual(compile('<div class="foo   bar    {baz}"></div>')({ baz: 'qux' }, value => { return value }), '<div class="foo bar qux"></div>')
assert.deepEqual(compile('<div class="{foo} bar"></div>')({ foo: 'baz' }, value => { return value }), '<div class="baz bar"></div>')
assert.deepEqual(compile('<div class="{foo} {bar}"></div>')({ foo: 'baz', bar: 'qux' }, value => { return value }), '<div class="baz qux"></div>')
assert.deepEqual(compile('<div class="{foo} bar {baz}"></div>')({ foo: 'baz', baz: 'qux' }, value => { return value }), '<div class="baz bar qux"></div>')
assert.deepEqual(compile('<div class="{foo}"></div>')({ foo: 'bar' }), '<div class="bar"></div>')
assert.deepEqual(compile('<div class.bind="foo"></div>')({ foo: 'bar' }), '<div class="bar"></div>')
assert.deepEqual(compile('<div class={foo}></div>')({ foo: 'bar' }), '<div class="bar"></div>')
assert.deepEqual(compile('<div></div>')(), '<div></div>')
assert.deepEqual(compile('<div html="{foo}"></div>')({ foo: 'bar' }), '<div>bar</div>')
assert.deepEqual(compile('<div html="foo"></div>')({}), '<div>foo</div>')
assert.deepEqual(compile('<div html="foo"></div>')(), '<div>foo</div>')
assert.deepEqual(compile('<div html="{foo}">xxx</div>')({ foo: 'bar' }), '<div>barxxx</div>')
assert.deepEqual(compile('<div html="{foo}"></div>')({ foo: '<div>baz</div>' }), '<div><div>baz</div></div>')
assert.deepEqual(compile('<div text="{foo}"></div>')({ foo: 'bar' }, html => html.replace('foo', 'bar')), '<div>bar</div>')
assert.deepEqual(compile('<div html={foo}></div>')({ foo: 'bar' }), '<div>bar</div>')
assert.deepEqual(compile('<div html="{ foo }"></div>')({ foo: 'bar' }), '<div>bar</div>')
assert.deepEqual(compile('<input type="text" value="{foo.bar}">')({ foo: { bar: 'baz' } }), '<input type="text" value="baz">')
assert.deepEqual(compile('<input type="text" value.bind="foo.bar">')({ foo: { bar: 'baz' } }), '<input type="text" value="baz">')
assert.deepEqual(compile('<input type="checkbox" autofocus>')(), '<input type="checkbox" autofocus>')
assert.deepEqual(compile('<input type="checkbox" checked>')(), '<input type="checkbox" checked>')
assert.deepEqual(compile('<input type="checkbox" readonly>')(), '<input type="checkbox" readonly>')
assert.deepEqual(compile('<input type="checkbox" disabled>')(), '<input type="checkbox" disabled>')
assert.deepEqual(compile('<input type="checkbox" formnovalidate>')(), '<input type="checkbox" formnovalidate>')
assert.deepEqual(compile('<input type="checkbox" multiple>')(), '<input type="checkbox" multiple>')
assert.deepEqual(compile('<input type="checkbox" required>')(), '<input type="checkbox" required>')
assert.deepEqual(compile('<input type="checkbox">')(), '<input type="checkbox">')
assert.deepEqual(compile('<input type="checkbox" checked="{foo}">')({ foo: true }), '<input type="checkbox" checked>')
assert.deepEqual(compile('<input type="checkbox" checked="{foo}">')({ foo: false }), '<input type="checkbox">')
assert.deepEqual(compile('<input type="checkbox" checked.bind="foo">')({ foo: true }), '<input type="checkbox" checked>')
assert.deepEqual(compile('<input type="checkbox" checked.bind="foo">')({ foo: false }), '<input type="checkbox">')
assert.deepEqual(compile('<input type="checkbox" readonly.bind="foo">')({ foo: true }), '<input type="checkbox" readonly>')
assert.deepEqual(compile('<input type="checkbox" readonly.bind="foo">')({ foo: false }), '<input type="checkbox">')
assert.deepEqual(compile('<input type="checkbox" disabled.bind="foo">')({ foo: true }), '<input type="checkbox" disabled>')
assert.deepEqual(compile('<input type="checkbox" disabled.bind="foo">')({ foo: false }), '<input type="checkbox">')
assert.deepEqual(compile('<input type="checkbox" autofocus.bind="foo">')({ foo: true }), '<input type="checkbox" autofocus>')
assert.deepEqual(compile('<input type="checkbox" autofocus.bind="foo">')({ foo: false }), '<input type="checkbox">')
assert.deepEqual(compile('<input type="checkbox" formnovalidate.bind="foo">')({ foo: true }), '<input type="checkbox" formnovalidate>')
assert.deepEqual(compile('<input type="checkbox" formnovalidate.bind="foo">')({ foo: false }), '<input type="checkbox">')
assert.deepEqual(compile('<input type="checkbox" multiple.bind="foo">')({ foo: true }), '<input type="checkbox" multiple>')
assert.deepEqual(compile('<input type="checkbox" multiple.bind="foo">')({ foo: false }), '<input type="checkbox">')
assert.deepEqual(compile('<input type="checkbox" required.bind="foo">')({ foo: true }), '<input type="checkbox" required>')
assert.deepEqual(compile('<input type="checkbox" required.bind="foo">')({ foo: false }), '<input type="checkbox">')

assert.deepEqual(compile('<ul><slot repeat.for="todo in todos"><li html="{todo.description}"></li></slot></ul>')({
  todos: [
    { description: 'foo' },
    { description: 'bar' },
    { description: 'baz' },
    { description: 'qux' }
  ]
}), '<ul><li>foo</li><li>bar</li><li>baz</li><li>qux</li></ul>')

assert.deepEqual(compile('<ul><slot repeat.for="foo in bar"><li html="{foo.baz}"></li></slot></ul>')({
  bar: [
    { baz: 'foo' },
    { baz: 'bar' },
    { baz: 'baz' },
    { baz: 'qux' }
  ]
}), '<ul><li>foo</li><li>bar</li><li>baz</li><li>qux</li></ul>')

assert.deepEqual(compile('<ul><slot repeat.for="foo in bar"><slot repeat.for="baz in foo"><li html="{baz.qux}"></li></slot></slot></ul>')({
  bar: [
    [ { qux: 1 }, { qux: 2 } ],
    [ { qux: 3 }, { qux: 4 } ],
    [ { qux: 5 }, { qux: 6 } ]
  ]
}), '<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li></ul>')