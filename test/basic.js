const assert = require('assert')
const { compile } = require('..')

assert.deepEqual(compile('')(), '')
assert.deepEqual(compile('<!-- foo -->')(), '')
assert.deepEqual(compile('hello world')(), 'hello world')
assert.deepEqual(compile('<div></div>')(), '<div></div>')
assert.deepEqual(compile('<div>foo</div>')(), '<div>foo</div>')
assert.deepEqual(compile('foo<div></div>')(), 'foo<div></div>')
assert.deepEqual(compile('<div></div>foo')(), '<div></div>foo')
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
assert.deepEqual(compile('<slot html={foo.bar} />')({ foo: { bar: 'baz' } }), 'baz')
assert.deepEqual(compile('<slot text="{foo}"/>')({ foo: 'bar' }, html => html.replace('bar', 'foo')), 'foo')
assert.deepEqual(compile('<slot text="{foo.bar}"/>')({ foo: { bar: 'baz' } }, html => html.replace('baz', 'qux')), 'qux')
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
assert.deepEqual(compile('<div>{foo}</div>')({ foo: 'bar' }, html => html.replace('bar', 'baz')), '<div>baz</div>')
assert.deepEqual(compile('{foo}<div></div>')({ foo: 'bar' }, html => html.replace('bar', 'baz')), 'baz<div></div>')
assert.deepEqual(compile('<div></div>{foo}')({ foo: 'bar' }, html => html.replace('bar', 'baz')), '<div></div>baz')
assert.deepEqual(compile('<div>{foo} {bar}</div>')({ foo: 'bar', bar: 'baz' }, html => html.replace('bar', 'qux').replace('baz', 'quux')), '<div>qux quux</div>')
assert.deepEqual(compile('<div>hello {world}</div>')({ world: 'world' }, html => html.replace('world', 'mars')), '<div>hello mars</div>')
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
assert.deepEqual(compile('<h1>{title}</h1>')({ title: 'buxlabs' }, value => value), '<h1>buxlabs</h1>')
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
assert.deepEqual(compile('<span class="icon {name}"></span>')({ name: 'buxus' }), '<span class="icon buxus"></span>')

assert.deepEqual(compile('<ul><each todo in todos><li html="{todo.description}"></li></each></ul>')({
  todos: [
    { description: 'foo' },
    { description: 'bar' },
    { description: 'baz' },
    { description: 'qux' }
  ]
}), '<ul><li>foo</li><li>bar</li><li>baz</li><li>qux</li></ul>')

assert.deepEqual(compile('<ul><each foo in bar><li html="{foo.baz}"></li></each></ul>')({
  bar: [
    { baz: 'foo' },
    { baz: 'bar' },
    { baz: 'baz' },
    { baz: 'qux' }
  ]
}), '<ul><li>foo</li><li>bar</li><li>baz</li><li>qux</li></ul>')

assert.deepEqual(compile('<ul><each foo in bar><each baz in foo><li html="{baz.qux}"></li></each></each></ul>')({
  bar: [
    [ { qux: 1 }, { qux: 2 } ],
    [ { qux: 3 }, { qux: 4 } ],
    [ { qux: 5 }, { qux: 6 } ]
  ]
}), '<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li></ul>')

assert.deepEqual(compile('<ul><each todo in todos><li html="{todo.text}"></li></each></ul>')({
  todos: [
    { text: 'foo' },
    { text: 'bar' },
    { text: 'baz' }
  ]
}), '<ul><li>foo</li><li>bar</li><li>baz</li></ul>')

assert.deepEqual(compile('<div tag="{tag}"></div>')({ tag: 'button' }), '<button></button>')
assert.deepEqual(compile('<div tag="{tag}"></div>')({ tag: 'a' }), '<a></a>')
assert.deepEqual(compile('<div tag.bind="tag"></div>')({ tag: 'button' }), '<button></button>')
assert.deepEqual(compile('<div tag.bind="tag"></div>')({ tag: 'a' }), '<a></a>')
assert.deepEqual(compile('<if foo>bar</if>')({ foo: false }), '')
assert.deepEqual(compile('<if foo>bar</if>')({ foo: true }), 'bar')
assert.deepEqual(compile('<if foo>bar</if><if baz>qux</if>')({ foo: true, baz: true }), 'barqux')
assert.deepEqual(compile('<if foo>bar</if><if baz>qux</if>')({ foo: true, baz: false }), 'bar')
assert.deepEqual(compile('<if foo>bar</if><if baz>qux</if>')({ foo: false, baz: true }), 'qux')
assert.deepEqual(compile('<if foo>bar</if><if baz>qux</if>')({ foo: false, baz: false }), '')

assert.deepEqual(compile('<if foo.length>bar</if>')({ foo: [] }), '')
assert.deepEqual(compile('<if foo.length>bar</if>')({ foo: ['baz'] }), 'bar')

assert.deepEqual(compile('<if valid()>bar</if>')({ valid: () => false }), '')
assert.deepEqual(compile('<if valid()>bar</if>')({ valid: () => true }), 'bar')

assert.deepEqual(compile('<if foo>bar</if><else>baz</else>')({ foo: false }), 'baz')
assert.deepEqual(compile('<if foo>bar</if><else>baz</else>')({ foo: true }), 'bar')

assert.deepEqual(compile('<if foo>bar</if><elseif baz>qux</elseif>')({ foo: true, baz: true }), 'bar')
assert.deepEqual(compile('<if foo>bar</if><elseif baz>qux</elseif>')({ foo: true, baz: false }), 'bar')
assert.deepEqual(compile('<if foo>bar</if><elseif baz>qux</elseif>')({ foo: false, baz: false }), '')
assert.deepEqual(compile('<if foo>bar</if><elseif baz>qux</elseif>')({ foo: false, baz: true }), 'qux')

assert.deepEqual(compile('<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')({ foo: true, baz: true }), 'bar')
assert.deepEqual(compile('<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')({ foo: true, baz: false }), 'bar')
assert.deepEqual(compile('<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')({ foo: false, baz: false }), 'quux')
assert.deepEqual(compile('<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')({ foo: false, baz: true }), 'qux')

assert.deepEqual(compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')({ foo: true, baz: true, quux: true }), 'bar')
assert.deepEqual(compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')({ foo: true, baz: true, quux: false }), 'bar')
assert.deepEqual(compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')({ foo: true, baz: false, quux: true }), 'bar')
assert.deepEqual(compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')({ foo: true, baz: false, quux: false }), 'bar')
assert.deepEqual(compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')({ foo: false, baz: true, quux: false }), 'qux')
assert.deepEqual(compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')({ foo: false, baz: true, quux: true }), 'qux')
assert.deepEqual(compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')({ foo: false, baz: false, quux: true }), 'corge')
assert.deepEqual(compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')({ foo: false, baz: false, quux: false }), '')

assert.deepEqual(compile('<ul><each a in b><li html="{a.b}"></li></each></ul>')({
  b: [
    { b: 'foo' },
    { b: 'bar' }
  ]
}), '<ul><li>foo</li><li>bar</li></ul>')

assert.deepEqual(compile('<ul><each t in b><li html="{t.b}"></li></each></ul>')({
  b: [
    { b: 'foo' },
    { b: 'bar' }
  ]
}), '<ul><li>foo</li><li>bar</li></ul>')

assert.deepEqual(compile('<ul><each o in b><li html="{o.b}"></li></each></ul>')({
  b: [
    { b: 'foo' },
    { b: 'bar' }
  ]
}), '<ul><li>foo</li><li>bar</li></ul>')

assert.deepEqual(compile('<ul><each e in b><li html="{e.b}"></li></each></ul>')({
  b: [
    { b: 'foo' },
    { b: 'bar' }
  ]
}), '<ul><li>foo</li><li>bar</li></ul>')

assert.deepEqual(compile('<each foo in foos><img src="{foo.src}"></each>')({
  foos: [
    { title: 'foo', src: 'foo.jpg' },
    { title: 'bar', src: 'bar.jpg' }
  ]
}), '<img src="foo.jpg"><img src="bar.jpg">')

assert.deepEqual(compile('<each foo in foos><if foo.src><img src="{foo.src}"></if></each>')({
  foos: [
    { title: 'foo', src: 'foo.jpg' },
    { title: 'bar', src: null }
  ]
}), '<img src="foo.jpg">')

assert.deepEqual(compile('<for foo in foos><if foo.src><img src="{foo.src}"></if></for>')({
  foos: [
    { title: 'foo', src: 'foo.jpg' },
    { title: 'bar', src: null }
  ]
}), '<img src="foo.jpg">')

assert.deepEqual(compile('<each foo in foos><if foo.src><img src="{foo.src}"></if><elseif foo.href><a href="{foo.href}"></a></elseif></each>')({
  foos: [
    { title: 'foo', src: 'foo.jpg', href: null },
    { title: 'bar', src: null, href: null },
    { title: 'baz', src: null, href: 'https://buxlabs.pl' }
  ]
}), '<img src="foo.jpg"><a href="https://buxlabs.pl"></a>')

assert.deepEqual(compile('{foo}<each foo in bar><div>{foo.baz}</div></each>')({
  foo: 'bar',
  bar: [
    { baz: 'qux' },
    { baz: 'quux' },
    { baz: 'quuux' }
  ]
}, html => html), 'bar<div>qux</div><div>quux</div><div>quuux</div>')

assert.deepEqual(compile('<div>{foo}<each foo in bar><div>{foo.baz}</div></each></div>')({
  foo: 'bar',
  bar: [
    { baz: 'qux' },
    { baz: 'quux' },
    { baz: 'quuux' }
  ]
}, html => html), '<div>bar<div>qux</div><div>quux</div><div>quuux</div></div>')

assert.deepEqual(compile('<div>{foo}</div><each foo in bar><div>{foo.baz}</div></each>')({
  foo: 'bar',
  bar: [
    { baz: 'qux' },
    { baz: 'quux' },
    { baz: 'quuux' }
  ]
}, html => html), '<div>bar</div><div>qux</div><div>quux</div><div>quuux</div>')

assert.deepEqual(compile('<each foo in bar><div>{foo.baz}</div></each><div>{foo}</div>')({
  foo: 'bar',
  bar: [
    { baz: 'qux' },
    { baz: 'quux' },
    { baz: 'quuux' }
  ]
}, html => html), '<div>qux</div><div>quux</div><div>quuux</div><div>bar</div>')
