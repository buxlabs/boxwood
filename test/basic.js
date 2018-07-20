const { equal, deepStrictEqual, throws } = require('assert')
const { compile } = require('..')
const path = require('path')
const { readFileSync } = require('fs')

console.time('basic')
equal(compile('')(), '')
equal(compile('<!DOCTYPE html>')(), '<!doctype html>')
equal(compile('<!-- foo -->')(), '')
equal(compile('hello world')(), 'hello world')
equal(compile('<div></div>')(), '<div></div>')
equal(compile('<div>foo</div>')(), '<div>foo</div>')
equal(compile('foo<div></div>')(), 'foo<div></div>')
equal(compile('<div></div>foo')(), '<div></div>foo')
equal(compile('<input>')(), '<input>')
equal(compile('<input/>')(), '<input>')
equal(compile('<input type="number" value="100">')(), '<input type="number" value="100">')
equal(compile('<input    value="100">')(), '<input value="100">')
equal(compile('{hello}, world!')({ hello: 'Hello' }, html => html), 'Hello, world!')
equal(compile('<div>{hello}, world!</div>')({ hello: 'Hello' }, html => html), '<div>Hello, world!</div>')
equal(compile('{foo}')({ foo: 'foo' }, html => html), 'foo')
equal(compile('{foo.bar}')({ foo: { bar: 'bar' } }, html => html), 'bar')
equal(compile('{foo[bar]}')({ foo: { bar: 'bar' }, bar: 'bar' }, html => html), 'bar')
equal(compile('{foo.bar[baz]}')({ foo: { bar: { baz: 'baz' } }, baz: 'baz' }, html => html), 'baz')
equal(compile('{foo.bar.baz[qux]}')({ foo: { bar: { baz: { qux: 'qux' } } }, qux: 'qux' }, html => html), 'qux')
equal(compile('{foo[bar][baz]}')({ foo: { bar: { baz: 'baz' } }, bar: 'bar', baz: 'baz' }, html => html), 'baz')
equal(compile('{foo[bar][baz][qux]}')({ foo: { bar: { baz: { qux: 'qux' } } }, bar: 'bar', baz: 'baz', qux: 'qux' }, html => html), 'qux')
equal(compile('{foo[bar].baz}')({ foo: { bar: { baz: 'baz' } }, bar: 'bar' }, html => html), 'baz')
equal(compile('{foo[bar].baz[qux]}')({ foo: { bar: { baz: { qux: 'qux' } } }, bar: 'bar', qux: 'qux' }, html => html), 'qux')
equal(compile('{foo}{bar}')({ foo: 'foo', bar: 'bar' }, html => html), 'foobar')
equal(compile('<div html="foo"></div>')(), '<div>foo</div>')
equal(compile('<div text="foo"></div>')({}, html => html.replace('foo', 'bar')), '<div>bar</div>')
equal(compile('<div>{foo}</div>')({ foo: 'bar' }, html => html.replace('bar', 'baz')), '<div>baz</div>')
equal(compile('<div>{foo()}</div>')({ foo: () => 'bar' }, html => html.replace('bar', 'baz')), '<div>baz</div>')
equal(compile('<div>{foo("bar")}</div>')({ foo: bar => bar }, html => html.replace('bar', 'baz')), '<div>baz</div>')
equal(compile('<div>{foo.bar()}</div>')({ foo: { bar: () => 'baz' } }, html => html.replace('baz', 'qux')), '<div>qux</div>')
equal(compile('<div>{foo.bar.baz()}</div>')({ foo: { bar: { baz: () => 'qux' } } }, html => html.replace('qux', 'quux')), '<div>quux</div>')
equal(compile('<div>{foo(bar)}</div>')({ foo: string => string, bar: 'bar' }, html => html.replace('bar', 'baz')), '<div>baz</div>')
equal(compile('<div>{foo({ bar: baz })}</div>')({ foo: object => object.bar, baz: 'qux' }, html => html), '<div>qux</div>')
equal(compile('<div>{foo({ bar })}</div>')({ foo: object => object.bar, bar: 'baz' }, html => html), '<div>baz</div>')
equal(compile('<div>{foo(bar)}</div>')({ foo: array => array[0], bar: ['baz'] }, html => html.replace('test', 'test')), '<div>baz</div>')
equal(compile('<div>{foo(bar())}</div>')({ foo: string => string, bar: () => 'bar' }, html => html.replace('bar', 'baz')), '<div>baz</div>')
equal(compile('<div>{foo(bar(baz()))}</div>')({ foo: string => string, bar: string => string, baz: () => 'baz' }, html => html.replace('baz', 'qux')), '<div>qux</div>')
equal(compile('{foo}<div></div>')({ foo: 'bar' }, html => html.replace('bar', 'baz')), 'baz<div></div>')
equal(compile('<div></div>{foo}')({ foo: 'bar' }, html => html.replace('bar', 'baz')), '<div></div>baz')
equal(compile('<div>{foo} {bar}</div>')({ foo: 'bar', bar: 'baz' }, html => html.replace('bar', 'qux').replace('baz', 'quux')), '<div>qux quux</div>')
equal(compile('<div>hello {world}</div>')({ world: 'world' }, html => html.replace('world', 'mars')), '<div>hello mars</div>')
equal(compile('<div class="foo" html="{bar}"></div>')({ bar: 'baz' }), '<div class="foo">baz</div>')
equal(compile('<div class="foo" text="{bar}"></div>')({ bar: 'baz' }, value => { return value }), '<div class="foo">baz</div>')
equal(compile('<div class="foo {bar}"></div>')({ bar: 'baz' }, value => { return value }), '<div class="foo baz"></div>')
equal(compile('<div class="foo bar {baz}"></div>')({ baz: 'qux' }, value => { return value }), '<div class="foo bar qux"></div>')
equal(compile('<div class="foo   bar    {baz}"></div>')({ baz: 'qux' }, value => { return value }), '<div class="foo bar qux"></div>')
equal(compile('<div class="{foo} bar"></div>')({ foo: 'baz' }, value => { return value }), '<div class="baz bar"></div>')
equal(compile('<div class="{foo} {bar}"></div>')({ foo: 'baz', bar: 'qux' }, value => { return value }), '<div class="baz qux"></div>')
equal(compile('<div class="{foo} bar {baz}"></div>')({ foo: 'baz', baz: 'qux' }, value => { return value }), '<div class="baz bar qux"></div>')
equal(compile('<div class="{foo}"></div>')({ foo: 'bar' }, html => html), '<div class="bar"></div>')
equal(compile('<div class.bind="foo"></div>')({ foo: 'bar' }, html => html), '<div class="bar"></div>')
equal(compile('<div class={foo}></div>')({ foo: 'bar' }, html => html), '<div class="bar"></div>')
equal(compile('<div></div>')(), '<div></div>')
equal(compile('<h1>{title}</h1>')({ title: 'buxlabs' }, value => value), '<h1>buxlabs</h1>')
equal(compile('<div html="{foo}"></div>')({ foo: 'bar' }), '<div>bar</div>')
equal(compile('<div html="foo"></div>')({}), '<div>foo</div>')
equal(compile('<div html="foo"></div>')(), '<div>foo</div>')
equal(compile('<div html="{foo}">xxx</div>')({ foo: 'bar' }), '<div>barxxx</div>')
equal(compile('<div html="{foo}"></div>')({ foo: '<div>baz</div>' }), '<div><div>baz</div></div>')
equal(compile('<div text="{foo}"></div>')({ foo: 'bar' }, html => html.replace('foo', 'bar')), '<div>bar</div>')
equal(compile('<div html={foo}></div>')({ foo: 'bar' }), '<div>bar</div>')
equal(compile('<div html="{ foo }"></div>')({ foo: 'bar' }), '<div>bar</div>')
equal(compile('<input type="text" value="{foo.bar}">')({ foo: { bar: 'baz' } }, html => html), '<input type="text" value="baz">')
equal(compile('<input type="text" value.bind="foo.bar">')({ foo: { bar: 'baz' } }), '<input type="text" value="baz">')
equal(compile('<input type="checkbox" autofocus>')(), '<input type="checkbox" autofocus>')
equal(compile('<input type="checkbox" checked>')(), '<input type="checkbox" checked>')
equal(compile('<input type="checkbox" readonly>')(), '<input type="checkbox" readonly>')
equal(compile('<input type="checkbox" disabled>')(), '<input type="checkbox" disabled>')
equal(compile('<input type="checkbox" formnovalidate>')(), '<input type="checkbox" formnovalidate>')
equal(compile('<input type="checkbox" multiple>')(), '<input type="checkbox" multiple>')
equal(compile('<input type="checkbox" required>')(), '<input type="checkbox" required>')
equal(compile('<input type="checkbox">')(), '<input type="checkbox">')
equal(compile('<input type="checkbox" checked="{foo}">')({ foo: true }), '<input type="checkbox" checked>')
equal(compile('<input type="checkbox" checked="{foo}">')({ foo: false }), '<input type="checkbox">')
equal(compile('<input type="checkbox" checked.bind="foo">')({ foo: true }), '<input type="checkbox" checked>')
equal(compile('<input type="checkbox" checked.bind="foo">')({ foo: false }), '<input type="checkbox">')
equal(compile('<input type="checkbox" readonly.bind="foo">')({ foo: true }), '<input type="checkbox" readonly>')
equal(compile('<input type="checkbox" readonly.bind="foo">')({ foo: false }), '<input type="checkbox">')
equal(compile('<input type="checkbox" disabled.bind="foo">')({ foo: true }), '<input type="checkbox" disabled>')
equal(compile('<input type="checkbox" disabled.bind="foo">')({ foo: false }), '<input type="checkbox">')
equal(compile('<input type="checkbox" autofocus.bind="foo">')({ foo: true }), '<input type="checkbox" autofocus>')
equal(compile('<input type="checkbox" autofocus.bind="foo">')({ foo: false }), '<input type="checkbox">')
equal(compile('<input type="checkbox" formnovalidate.bind="foo">')({ foo: true }), '<input type="checkbox" formnovalidate>')
equal(compile('<input type="checkbox" formnovalidate.bind="foo">')({ foo: false }), '<input type="checkbox">')
equal(compile('<input type="checkbox" multiple.bind="foo">')({ foo: true }), '<input type="checkbox" multiple>')
equal(compile('<input type="checkbox" multiple.bind="foo">')({ foo: false }), '<input type="checkbox">')
equal(compile('<input type="checkbox" required.bind="foo">')({ foo: true }), '<input type="checkbox" required>')
equal(compile('<input type="checkbox" required.bind="foo">')({ foo: false }), '<input type="checkbox">')
equal(compile('<span class="icon {name}"></span>')({ name: 'buxus' }, html => html), '<span class="icon buxus"></span>')
equal(compile('<span class="icon icon-{name}"></span>')({ name: 'buxus' }, html => html), '<span class="icon icon-buxus"></span>')
equal(compile('<a href="blog/{name}">{title}</a>')({ name: 'foo', title: 'Foo' }, html => html), '<a href="blog/foo">Foo</a>')

equal(compile('{foo ? "bar" : "baz"}')({ foo: true }, html => html), 'bar')
equal(compile('{foo ? "bar" : "baz"}')({ foo: false }, html => html), 'baz')
equal(compile('{foo ? bar : baz}')({ foo: true, bar: 'bar', baz: 'baz' }, html => html), 'bar')
equal(compile('{foo ? bar : baz}')({ foo: false, bar: 'bar', baz: 'baz' }, html => html), 'baz')
equal(compile('{foo.bar ? bar : baz}')({ foo: { bar: true }, bar: 'bar', baz: 'baz' }, html => html), 'bar')
equal(compile('{foo.bar ? bar : baz}')({ foo: { bar: false }, bar: 'bar', baz: 'baz' }, html => html), 'baz')
equal(compile('{foo.bar ? bar.baz : baz.qux}')({ foo: { bar: true }, bar: { baz: 'bar' }, baz: { qux: 'baz' } }, html => html), 'bar')
equal(compile('{foo.bar ? bar.baz : baz.qux}')({ foo: { bar: false }, bar: { baz: 'bar' }, baz: { qux: 'baz' } }, html => html), 'baz')

equal(compile('<for baz in qux>{foo({ bar: baz })}</for>')({ foo: object => object.bar, qux: ['qux', 'quux'] }, html => html), 'quxquux')

equal(compile(`
<a href='blog/{name}'>
  {title}
</a>
`)({ name: 'foo', title: 'Foo' }, html => html), '<a href="blog/foo">Foo</a>')

equal(compile('<div>{foo} {bar}</div>')({ foo: 'foo', bar: 'bar' }, html => html), '<div>foo bar</div>')
equal(compile('{foo}')({ foo: undefined }, html => html), 'undefined')
equal(compile('{foo}')({ foo: null }, html => html), 'null')

equal(compile(`
<div>
  {foo} {bar}
</div>
`)({ foo: 'foo', bar: 'bar' }, html => html), '<div>foo bar</div>')

equal(compile('<ul><for todo in todos><li html="{todo.description}"></li></for></ul>')({
  todos: [
    { description: 'foo' },
    { description: 'bar' },
    { description: 'baz' },
    { description: 'qux' }
  ]
}), '<ul><li>foo</li><li>bar</li><li>baz</li><li>qux</li></ul>')

equal(compile('<ul><for foo in bar><li html="{foo.baz}"></li></for></ul>')({
  bar: [
    { baz: 'foo' },
    { baz: 'bar' },
    { baz: 'baz' },
    { baz: 'qux' }
  ]
}), '<ul><li>foo</li><li>bar</li><li>baz</li><li>qux</li></ul>')

equal(compile('<ul><for foo in bar><for baz in foo><li html="{baz.qux}"></li></for></for></ul>')({
  bar: [
    [ { qux: 1 }, { qux: 2 } ],
    [ { qux: 3 }, { qux: 4 } ],
    [ { qux: 5 }, { qux: 6 } ]
  ]
}), '<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li></ul>')

equal(compile('<ul><for foo in bar><for baz in foo.qux><li html="{baz}"></li></for></for></ul>')({
  bar: [
    { qux: [1, 2] },
    { qux: [3, 4] },
    { qux: [5, 6] }
  ]
}), '<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li></ul>')

equal(compile('<ul><for todo in todos><li html="{todo.text}"></li></for></ul>')({
  todos: [
    { text: 'foo' },
    { text: 'bar' },
    { text: 'baz' }
  ]
}), '<ul><li>foo</li><li>bar</li><li>baz</li></ul>')

equal(compile('<div tag="{tag}"></div>')({ tag: 'button' }), '<button></button>')
equal(compile('<div tag="{tag}"></div>')({ tag: 'a' }), '<a></a>')
equal(compile('<div tag.bind="tag"></div>')({ tag: 'button' }), '<button></button>')
equal(compile('<div tag.bind="tag"></div>')({ tag: 'a' }), '<a></a>')
equal(compile('<if foo>bar</if>')({ foo: false }), '')
equal(compile('<if foo>bar</if>')({ foo: true }), 'bar')
equal(compile('<if foo>bar</if><if baz>qux</if>')({ foo: true, baz: true }), 'barqux')
equal(compile('<if foo>bar</if><if baz>qux</if>')({ foo: true, baz: false }), 'bar')
equal(compile('<if foo>bar</if><if baz>qux</if>')({ foo: false, baz: true }), 'qux')
equal(compile('<if foo>bar</if><if baz>qux</if>')({ foo: false, baz: false }), '')

equal(compile('<if foo.length>bar</if>')({ foo: [] }), '')
equal(compile('<if foo.length>bar</if>')({ foo: ['baz'] }), 'bar')

equal(compile('<if valid()>bar</if>')({ valid: () => false }), '')
equal(compile('<if valid()>bar</if>')({ valid: () => true }), 'bar')

equal(compile('<if foo>bar</if><else>baz</else>')({ foo: false }), 'baz')
equal(compile('<if foo>bar</if><else>baz</else>')({ foo: true }), 'bar')

equal(compile('<if foo>bar</if><elseif baz>qux</elseif>')({ foo: true, baz: true }), 'bar')
equal(compile('<if foo>bar</if><elseif baz>qux</elseif>')({ foo: true, baz: false }), 'bar')
equal(compile('<if foo>bar</if><elseif baz>qux</elseif>')({ foo: false, baz: false }), '')
equal(compile('<if foo>bar</if><elseif baz>qux</elseif>')({ foo: false, baz: true }), 'qux')

equal(compile('<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')({ foo: true, baz: true }), 'bar')
equal(compile('<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')({ foo: true, baz: false }), 'bar')
equal(compile('<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')({ foo: false, baz: false }), 'quux')
equal(compile('<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')({ foo: false, baz: true }), 'qux')

equal(compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')({ foo: true, baz: true, quux: true }), 'bar')
equal(compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')({ foo: true, baz: true, quux: false }), 'bar')
equal(compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')({ foo: true, baz: false, quux: true }), 'bar')
equal(compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')({ foo: true, baz: false, quux: false }), 'bar')
equal(compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')({ foo: false, baz: true, quux: false }), 'qux')
equal(compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')({ foo: false, baz: true, quux: true }), 'qux')
equal(compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')({ foo: false, baz: false, quux: true }), 'corge')
equal(compile('<if foo>bar</if><elseif baz>qux</elseif><elseif quux>corge</elseif>')({ foo: false, baz: false, quux: false }), '')

equal(compile('<ul><for a in b><li html="{a.b}"></li></for></ul>')({
  b: [
    { b: 'foo' },
    { b: 'bar' }
  ]
}), '<ul><li>foo</li><li>bar</li></ul>')

equal(compile('<ul><for t in b><li html="{t.b}"></li></for></ul>')({
  b: [
    { b: 'foo' },
    { b: 'bar' }
  ]
}), '<ul><li>foo</li><li>bar</li></ul>')

equal(compile('<ul><for o in b><li html="{o.b}"></li></for></ul>')({
  b: [
    { b: 'foo' },
    { b: 'bar' }
  ]
}), '<ul><li>foo</li><li>bar</li></ul>')

equal(compile('<ul><for e in b><li html="{e.b}"></li></for></ul>')({
  b: [
    { b: 'foo' },
    { b: 'bar' }
  ]
}), '<ul><li>foo</li><li>bar</li></ul>')

equal(compile('<for foo in foos><img src="{foo.src}"></for>')({
  foos: [
    { title: 'foo', src: 'foo.jpg' },
    { title: 'bar', src: 'bar.jpg' }
  ]
}, html => html), '<img src="foo.jpg"><img src="bar.jpg">')

equal(compile('<for foo in foos><if foo.src><img src="{foo.src}"></if></for>')({
  foos: [
    { title: 'foo', src: 'foo.jpg' },
    { title: 'bar', src: null }
  ]
}, html => html), '<img src="foo.jpg">')

equal(compile('<for foo in foos><if foo.src><img src="{foo.src}"></if></for>')({
  foos: [
    { title: 'foo', src: 'foo.jpg' },
    { title: 'bar', src: null }
  ]
}, html => html), '<img src="foo.jpg">')

equal(compile('<for foo in foos><if foo.src><img src="{foo.src}"></if><elseif foo.href><a href="{foo.href}"></a></elseif></for>')({
  foos: [
    { title: 'foo', src: 'foo.jpg', href: null },
    { title: 'bar', src: null, href: null },
    { title: 'baz', src: null, href: 'https://buxlabs.pl' }
  ]
}, html => html), '<img src="foo.jpg"><a href="https://buxlabs.pl"></a>')

equal(compile('{foo}<for foo in bar><div>{foo.baz}</div></for>')({
  foo: 'bar',
  bar: [
    { baz: 'qux' },
    { baz: 'quux' },
    { baz: 'quuux' }
  ]
}, html => html), 'bar<div>qux</div><div>quux</div><div>quuux</div>')

equal(compile('<div>{foo}<for foo in bar><div>{foo.baz}</div></for></div>')({
  foo: 'bar',
  bar: [
    { baz: 'qux' },
    { baz: 'quux' },
    { baz: 'quuux' }
  ]
}, html => html), '<div>bar<div>qux</div><div>quux</div><div>quuux</div></div>')

equal(compile('<div>{foo}</div><for foo in bar><div>{foo.baz}</div></for>')({
  foo: 'bar',
  bar: [
    { baz: 'qux' },
    { baz: 'quux' },
    { baz: 'quuux' }
  ]
}, html => html), '<div>bar</div><div>qux</div><div>quux</div><div>quuux</div>')

equal(compile('<for foo in bar><div>{foo.baz}</div></for><div>{foo}</div>')({
  foo: 'bar',
  bar: [
    { baz: 'qux' },
    { baz: 'quux' },
    { baz: 'quuux' }
  ]
}, html => html), '<div>qux</div><div>quux</div><div>quuux</div><div>bar</div>')

equal(compile('<try>{foo.bar}</try><catch>baz</catch>')({
  foo: { bar: 'bar' }
}, html => html), 'bar')

equal(compile('<try>{foo.bar}</try><catch>baz</catch>')({}), 'baz')

equal(compile('<try>{foo.bar.baz}</try><catch>qux</catch>')({
  foo: { bar: { baz: 'baz' } }
}, html => html), 'baz')

equal(compile('<try>{foo.bar.baz}</try><catch>qux</catch>')({}), 'qux')

equal(compile('<try>{foo.bar.baz.bam}</try><catch>qux</catch>')({
  foo: { bar: { baz: { bam: 'bam' } } }
}, html => html), 'bam')

equal(compile('<try>{foo.bar.baz.bam}</try><catch>qux</catch>')({}), 'qux')

equal(compile(`
<try>{foo.bar}</try>
<catch>baz</catch>
`)({
  foo: { bar: 'bar' }
}, html => html), 'bar')

// equal(compile('<try><div>{foo.bar}</div></try><catch>baz</catch>')({}), 'baz')

equal(compile('<unless foo>bar</unless>')({
  foo: false
}, html => html), 'bar')

equal(compile('<unless foo>bar</unless>')({
  foo: true
}, html => html), '')

equal(compile('<unless foo>bar</unless><else>baz</else>')({
  foo: false
}, html => html), 'bar')

equal(compile('<unless foo>bar</unless><else>baz</else>')({
  foo: true
}, html => html), 'baz')

equal(compile('<unless foo>bar</unless><elseif bar>baz</elseif>')({
  foo: true,
  bar: true
}, html => html), 'baz')

equal(compile('<unless foo>bar</unless><elseif bar>baz</elseif>')({
  foo: true,
  bar: false
}, html => html), '')

equal(compile('<unless foo>bar</unless><elseunless bar>baz</elseunless>')({
  foo: true,
  bar: false
}, html => html), 'baz')

equal(compile(`
<unless foo>bar</unless>
<elseunless bar>baz</elseunless>
`)({
  foo: true,
  bar: false
}, html => html), 'baz')

equal(compile(`
<if foo>bar</if>
<elseunless bar>baz</elseunless>
`)({
  foo: false,
  bar: false
}, html => html), 'baz')

equal(compile('<unless foo>bar</unless><elseunless bar>baz</elseunless>')({
  foo: true,
  bar: true
}, html => html), '')

equal(compile(`
<if foo>bar</if>
<else>baz</else>
`)({
  foo: true
}, html => html), 'bar')

equal(compile(`
<if foo>bar</if>
<else>baz</else>
`)({
  foo: false
}, html => html), 'baz')

equal(compile(`
<if foo>bar</if>
<elseif bar>baz</else>
`)({
  foo: true,
  bar: false
}, html => html), 'bar')

equal(compile(`
<if foo>bar</if>
<elseif bar>baz</else>
`)({
  foo: false,
  bar: true
}, html => html), 'baz')

equal(compile('<if foo and bar>baz</if>')({ foo: true, bar: true }, html => html), 'baz')
equal(compile('<if foo and bar>baz</if>')({ foo: false, bar: true }, html => html), '')
equal(compile('<if foo and bar>baz</if>')({ foo: true, bar: false }, html => html), '')

equal(compile('<if foo nand bar>baz</if>')({ foo: false, bar: true }, html => html), 'baz')
equal(compile('<if foo nand bar>baz</if>')({ foo: true, bar: true }, html => html), '')

equal(compile('<if foo or bar>baz</if>')({ foo: true, bar: true }, html => html), 'baz')
equal(compile('<if foo or bar>baz</if>')({ foo: true, bar: false }, html => html), 'baz')
equal(compile('<if foo or bar>baz</if>')({ foo: false, bar: true }, html => html), 'baz')
equal(compile('<if foo or bar>baz</if>')({ foo: false, bar: false }, html => html), '')

equal(compile('<if foo xor bar>baz</if>')({ foo: false, bar: true }, html => html), 'baz')
equal(compile('<if foo xor bar>baz</if>')({ foo: true, bar: false }, html => html), 'baz')
equal(compile('<if foo xor bar>baz</if>')({ foo: false, bar: false }, html => html), '')
equal(compile('<if foo xor bar>baz</if>')({ foo: true, bar: true }, html => html), '')

equal(compile('<if foo nor bar>baz</if>')({ foo: false, bar: true }, html => html), '')
equal(compile('<if foo nor bar>baz</if>')({ foo: false, bar: false }, html => html), 'baz')

equal(compile('<if foo eq bar>baz</if>')({ foo: 42, bar: 42 }, html => html), 'baz')
equal(compile('<if foo eq bar>baz</if>')({ foo: 40, bar: 42 }, html => html), '')
equal(compile('<if foo eq bar>baz</if>')({ foo: '42', bar: 42 }, html => html), '')

equal(compile('<if foo neq bar>baz</if>')({ foo: 42, bar: 42 }, html => html), '')
equal(compile('<if foo neq bar>baz</if>')({ foo: 40, bar: 42 }, html => html), 'baz')
equal(compile('<if foo neq bar>baz</if>')({ foo: '42', bar: 42 }, html => html), 'baz')
equal(compile('<if foo neq="bar">baz</if>')({ foo: 'bar', bar: 'bar' }, html => html), '')
equal(compile('<if foo neq="{42}">baz</if>')({ foo: 42, bar: 42 }, html => html), '')
equal(compile('<if foo neq="bar">baz</if>')({ foo: 'qux', bar: 'bar' }, html => html), 'baz')
equal(compile('<if foo neq="{42}">baz</if>')({ foo: 10, bar: 42 }, html => html), 'baz')

equal(compile('<if foo is equal to="bar">baz</if>')({ foo: 'bar', bar: 'bar' }, html => html), 'baz')
equal(compile('<if foo is equal to="{42}">baz</if>')({ foo: 42, bar: 42 }, html => html), 'baz')
equal(compile('<if foo is equal to="bar">baz</if>')({ foo: 'qux', bar: 'bar' }, html => html), '')
equal(compile('<if foo is equal to="{42}">baz</if>')({ foo: 10, bar: 42 }, html => html), '')

equal(compile('<if foo is not equal to="bar">baz</if>')({ foo: 'bar', bar: 'bar' }, html => html), '')
equal(compile('<if foo is not equal to="{42}">baz</if>')({ foo: 42, bar: 42 }, html => html), '')
equal(compile('<if foo is not equal to="bar">baz</if>')({ foo: 'qux', bar: 'bar' }, html => html), 'baz')
equal(compile('<if foo is not equal to="{42}">baz</if>')({ foo: 10, bar: 42 }, html => html), 'baz')

equal(compile('<if foo gt bar>baz</if>')({ foo: 42, bar: 30 }, html => html), 'baz')
equal(compile('<if foo gt two>baz</if>')({ foo: 42 }, html => html), 'baz')
equal(compile('<if foo gt two>baz</if>')({ foo: 1 }, html => html), '')
equal(compile('<if foo gt bar>baz</if>')({ foo: 42, bar: 42 }, html => html), '')
equal(compile('<if foo gt bar>baz</if>')({ foo: 42, bar: 50 }, html => html), '')

equal(compile('<if foo gte bar>baz</if>')({ foo: 42, bar: 30 }, html => html), 'baz')
equal(compile('<if foo gte bar>baz</if>')({ foo: 42, bar: 42 }, html => html), 'baz')
equal(compile('<if foo gte bar>baz</if>')({ foo: 42, bar: 50 }, html => html), '')

equal(compile('<if foo lt bar>baz</if>')({ foo: 42, bar: 30 }, html => html), '')
equal(compile('<if foo lt bar>baz</if>')({ foo: 42, bar: 42 }, html => html), '')
equal(compile('<if foo lt bar>baz</if>')({ foo: 42, bar: 50 }, html => html), 'baz')

equal(compile('<if foo lte bar>baz</if>')({ foo: 42, bar: 30 }, html => html), '')
equal(compile('<if foo lte bar>baz</if>')({ foo: 42, bar: 42 }, html => html), 'baz')
equal(compile('<if foo lte bar>baz</if>')({ foo: 42, bar: 50 }, html => html), 'baz')
equal(compile('<if foo lte="{bar.baz - 2}">baz</if>')({ foo: 2, bar: { baz: 10 } }, html => html), 'baz')
equal(compile('<if foo lte="{bar.baz - 2}">baz</if>')({ foo: 100, bar: { baz: 10 } }, html => html), '')

equal(compile('<if foo equals bar>baz</if>')({ foo: 42, bar: 42 }, html => html), 'baz')
equal(compile('<if foo equals bar>baz</if>')({ foo: 40, bar: 42 }, html => html), '')
equal(compile('<if foo equals bar>baz</if>')({ foo: '42', bar: 42 }, html => html), '')

equal(compile('<if foo is less than bar>baz</if>')({ foo: 100, bar: 50 }, html => html), '')
equal(compile('<if foo is less than bar>baz</if>')({ foo: 50, bar: 50 }, html => html), '')
equal(compile('<if foo is less than bar>baz</if>')({ foo: 30, bar: 40 }, html => html), 'baz')
equal(compile('<if foo is less than or equals bar>baz</if>')({ foo: 30, bar: 40 }, html => html), 'baz')
equal(compile('<if foo is less than or equals bar>baz</if>')({ foo: 40, bar: 30 }, html => html), '')
equal(compile('<if foo is less than or equals bar>baz</if>')({ foo: 30, bar: 30 }, html => html), 'baz')

equal(compile('<if foo is greater than bar>baz</if>')({ foo: 100, bar: 50 }, html => html), 'baz')
equal(compile('<if foo is greater than bar>baz</if>')({ foo: 50, bar: 50 }, html => html), '')
equal(compile('<if foo is greater than bar>baz</if>')({ foo: 30, bar: 40 }, html => html), '')
equal(compile('<if foo is greater than or equals bar>baz</if>')({ foo: 30, bar: 40 }, html => html), '')
equal(compile('<if foo is greater than or equals bar>baz</if>')({ foo: 40, bar: 40 }, html => html), 'baz')
equal(compile('<if foo is greater than or equals bar>baz</if>')({ foo: 50, bar: 40 }, html => html), 'baz')

equal(compile('<if foo[bar]>baz</if>')({ foo: { bar: true }, bar: 'bar' }, html => html), 'baz')
equal(compile('<if foo[bar]>baz</if>')({ foo: { bar: false }, bar: 'bar' }, html => html), '')

equal(compile('<if foo["bar"].baz>ban</if>')({
 foo: { bar: { baz: 'baz' } }
}, html => html), 'ban')

equal(compile('<if foo["bar"].baz>ban</if>')({
 foo: { bar: {} }
}, html => html), '')

equal(compile('<if not foo["bar"].baz>ban</if>')({
 foo: { bar: {} }
}, html => html), 'ban')

equal(compile('<if foo[qux].baz>ban</if>')({
 foo: { bar: { baz: 'baz' } },
 qux: 'bar'
}, html => html), 'ban')

equal(compile('<if foo().bar("baz")>baz</if>')({
  foo () {
    return { bar (string) {return string} }
  }
}, html => html), 'baz')

equal(compile('<if foo().bar("")>baz</if>')({
  foo () {
    return { bar (string) {return string} }
  }
}, html => html), '')

equal(compile('<if not foo().bar("")>baz</if>')({
  foo () {
    return { bar (string) {return string} }
  }
}, html => html), 'baz')

equal(compile('<if foo is present>bar</if>')({ foo: null }, html => html), 'bar')
equal(compile('<if foo is present>bar</if>')({ foo: false }, html => html), 'bar')
equal(compile('<if foo is present>bar</if>')({ foo: true }, html => html), 'bar')
equal(compile('<if foo is present>baz</if>')({ foo: {} }, html => html), 'baz')
equal(compile('<if foo is present>baz</if>')({}, html => html), '')
equal(compile('<if foo is present>bar</if>')({ foo: undefined }, html => html), '')
equal(compile('<if foo.bar is not present>baz</if>')({ foo: '' }, html => html), 'baz')
equal(compile('<if foo.bar is not present>baz</if>')({ foo: { bar: 'baz' } }, html => html), '')
equal(compile('<if foo is not present>baz</if>')({}, html => html), 'baz')
equal(compile('<if foo is not present>bar</if>')({ foo: undefined }, html => html), 'bar')

equal(compile('<if foo is defined>baz</if>')({ foo: {} }, html => html), 'baz')
equal(compile('<if foo is defined>{bar}</if>')({ foo: {}, bar: 'ban' }, html => html), 'ban')
equal(compile('<if foo is defined>{bar}</if>')({ foo: null , bar: null }, html => html), 'null')
equal(compile('<if foo is defined>baz</if>')({ foo: undefined }, html => html), '')

equal(compile('<if foo are present>bar</if>')({ foo: undefined }, html => html), '')
equal(compile('<if foo are present>bar</if>')({ foo: [] }, html => html), 'bar')
equal(compile('<if foo are present>bar</if>')({ foo: 'qux' }, html => html), 'bar')
equal(compile('<if foo are not present>bar</if>')({ foo: undefined }, html => html), 'bar')
equal(compile('<if foo are not present>bar</if>')({ foo: [] }, html => html), '')
equal(compile('<if foo are not present>bar</if>')({ foo: 'qux' }, html => html), '')

equal(compile('<if foo is positive>baz</if>')({ foo: 1 }, html => html), 'baz')
equal(compile('<if foo is positive>baz</if>')({ foo: 0 }, html => html), '')
equal(compile('<if foo is positive>baz</if>')({ foo: -1 }, html => html), '')
equal(compile('<if foo is_positive>baz</if>')({ foo: 1 }, html => html), 'baz')
equal(compile('<if foo is not positive>baz</if>')({ foo: 1 }, html => html), '')
equal(compile('<if foo is not positive>baz</if>')({ foo: 0 }, html => html), 'baz')
equal(compile('<if foo is not positive>baz</if>')({ foo: -1 }, html => html), 'baz')

equal(compile('<if foo is alpha>baz</if>')({ foo: 'bar' }, html => html), 'baz')
equal(compile('<if foo is alpha>baz</if>')({ foo: '' }, html => html), 'baz')
equal(compile('<if foo is alpha>baz</if>')({ foo: 'BaR' }, html => html), 'baz')
equal(compile('<if foo is alpha>baz</if>')({ foo: '123' }, html => html), '')
equal(compile('<if foo is alpha>baz</if>')({ foo: 'bar baz' }, html => html), '')
equal(compile('<if foo is not alpha>baz</if>')({ foo: 'bar' }, html => html), '')
equal(compile('<if foo is not alpha>baz</if>')({ foo: '' }, html => html), '')
equal(compile('<if foo is not alpha>baz</if>')({ foo: 'BaR' }, html => html), '')
equal(compile('<if foo is not alpha>baz</if>')({ foo: '123' }, html => html), 'baz')
equal(compile('<if foo is not alpha>baz</if>')({ foo: 'bar baz' }, html => html), 'baz')

equal(compile('<if foo is alphanumeric>baz</if>')({ foo: '1234' }, html => html), 'baz')
equal(compile('<if foo is alphanumeric>baz</if>')({ foo: '1234bar' }, html => html), 'baz')
equal(compile('<if foo is alphanumeric>baz</if>')({ foo: '' }, html => html), 'baz')
equal(compile('<if foo is not alphanumeric>baz</if>')({ foo: '1234' }, html => html), '')
equal(compile('<if foo is not alphanumeric>baz</if>')({ foo: '' }, html => html), '')
equal(compile('<if foo is not alphanumeric>baz</if>')({ foo: '1234bar' }, html => html), '')

equal(compile('<if foo is negative>baz</if>')({ foo: 1 }, html => html), '')
equal(compile('<if foo is negative>baz</if>')({ foo: 0 }, html => html), '')
equal(compile('<if foo is negative>baz</if>')({ foo: -1 }, html => html), 'baz')
equal(compile('<if foo is not negative>baz</if>')({ foo: 1 }, html => html), 'baz')
equal(compile('<if foo is not negative>baz</if>')({ foo: 0 }, html => html), 'baz')
equal(compile('<if foo is not negative>baz</if>')({ foo: -1 }, html => html), '')

equal(compile('<if foo is finite>baz</if>')({ foo: 100 }, html => html), 'baz')
equal(compile('<if foo is finite>baz</if>')({ foo: Infinity }, html => html), '')
equal(compile('<if foo is finite>baz</if>')({ foo: -Infinity }, html => html), '')
equal(compile('<if foo is finite>baz</if>')({ foo: 0 }, html => html), 'baz')
equal(compile('<if foo is finite>baz</if>')({ foo: NaN }, html => html), '')
equal(compile('<if foo is finite>baz</if>')({ foo: 2e64 }, html => html), 'baz')
equal(compile('<if foo is not finite>baz</if>')({ foo: 100 }, html => html), '')
equal(compile('<if foo is not finite>baz</if>')({ foo: Infinity }, html => html), 'baz')
equal(compile('<if foo is not finite>baz</if>')({ foo: -Infinity }, html => html), 'baz')

equal(compile('<if foo is infinite>baz</if>')({ foo: 100 }, html => html), '')
equal(compile('<if foo is infinite>baz</if>')({ foo: Infinity }, html => html), 'baz')
equal(compile('<if foo is infinite>baz</if>')({ foo: -Infinity }, html => html), 'baz')
equal(compile('<if foo is infinite>baz</if>')({ foo: 0 }, html => html), '')
equal(compile('<if foo is infinite>baz</if>')({ foo: NaN }, html => html), '')
equal(compile('<if foo is infinite>baz</if>')({ foo: 2e1000 }, html => html), 'baz')
equal(compile('<if foo is not infinite>baz</if>')({ foo: Infinity }, html => html), '')
equal(compile('<if foo is not infinite>baz</if>')({ foo: -Infinity }, html => html), '')

equal(compile('<if foo is empty>baz</if>')({ foo: [] }, html => html), 'baz')
equal(compile('<if foo is empty>baz</if>')({ foo: [{ baz: 'bar' }, {}] }, html => html), '')
equal(compile('<if foo is empty>baz</if>')({ foo: '' }, html => html), 'baz')
equal(compile('<if foo is empty>baz</if>')({ foo: 'qux' }, html => html), '')
equal(compile('<if foo is empty>baz</if>')({ foo: null }, html => html), 'baz')
equal(compile('<if foo is empty>baz</if>')({ foo: undefined }, html => html), 'baz')
equal(compile('<if foo is empty>baz</if>')({ foo: {} }, html => html), 'baz')
equal(compile('<if foo is empty>baz</if>')({ foo: { bar: null } }, html => html), '')
equal(compile('<if foo is empty>baz</if>')({ foo: { 1: 'bar', 2: 'baz' } }, html => html), '')
equal(compile('<if foo is empty>baz</if>')({ foo: { bar: 'ban' } }, html => html), '')
equal(compile('<if foo is empty>baz</if>')({ foo: function () {} }, html => html), 'baz')
equal(compile('<if foo is empty>baz</if>')({ foo: new Map() }, html => html), 'baz')
equal(compile('<if foo is empty>baz</if>')({ foo: new Map([['foo', 'bar'], ['baz', 'ban']]) }, html => html), '')
equal(compile('<if foo is empty>baz</if>')({ foo: new Set() }, html => html), 'baz')
equal(compile('<if foo is empty>baz</if>')({ foo: new Set([1, 'foo', 'bar']) }, html => html), '')
equal(compile('<if foo is not empty>baz</if>')({ foo: [] }, html => html), '')
equal(compile('<if foo is not empty>baz</if>')({ foo: [{ baz: 'bar' }, {}] }, html => html), 'baz')
equal(compile('<if foo is not empty>baz</if>')({ foo: '' }, html => html), '')
equal(compile('<if foo is not empty>baz</if>')({ foo: 'qux' }, html => html), 'baz')
equal(compile('<if foo is not empty>baz</if>')({ foo: null }, html => html), '')
equal(compile('<if foo is not empty>baz</if>')({ foo: undefined }, html => html), '')
equal(compile('<if foo is not empty>baz</if>')({ foo: {} }, html => html), '')
equal(compile('<if foo is not empty>baz</if>')({ foo: { bar: null } }, html => html), 'baz')
equal(compile('<if foo is not empty>baz</if>')({ foo: { 1: 'bar', 2: 'baz' } }, html => html), 'baz')
equal(compile('<if foo is not empty>baz</if>')({ foo: { bar: 'ban' } }, html => html), 'baz')
equal(compile('<if foo is not empty>baz</if>')({ foo: function () {} }, html => html), '')
equal(compile('<if foo is not empty>baz</if>')({ foo: new Map() }, html => html), '')
equal(compile('<if foo is not empty>baz</if>')({ foo: new Map([['foo', 'bar'], ['baz', 'ban']]) }, html => html), 'baz')
equal(compile('<if foo is not empty>baz</if>')({ foo: new Set() }, html => html), '')
equal(compile('<if foo is not empty>baz</if>')({ foo: new Set([1, 'foo', 'bar']) }, html => html), 'baz')

equal(compile('<if foo are empty>baz</if>')({ foo: [1, 2, 3, 4] }, html => html), '')
equal(compile('<if foo are empty>baz</if>')({ foo: [[], [], []] }, html => html), '')
equal(compile('<if foo are empty>baz</if>')({ foo: [{ baz: 'bar' }, {}] }, html => html), '')
equal(compile('<if foo are not empty>baz</if>')({ foo: [1, 2, 3, 4] }, html => html), 'baz')
equal(compile('<if foo are not empty>baz</if>')({ foo: [[], [], []] }, html => html), 'baz')
equal(compile('<if foo are not empty>baz</if>')({ foo: [{ baz: 'bar' }, {}] }, html => html), 'baz')

equal(compile('<if foo is an empty array>baz</if>')({ foo: [] }, html => html), 'baz')
equal(compile('<if foo is an empty array>baz</if>')({ foo: [1, 2, 3, 4] }, html => html), '')
equal(compile('<if foo is not an empty array>baz</if>')({ foo: [1, 2, 3, 4] }, html => html), 'baz')

equal(compile('<if foo is an empty string>baz</if>')({ foo: '' }, html => html), 'baz')
equal(compile('<if foo is an empty string>baz</if>')({ foo: 'foo' }, html => html), '')
equal(compile('<if foo is not an empty string>baz</if>')({ foo: 'foo' }, html => html), 'baz')

equal(compile('<if foo is an empty set>baz</if>')({ foo: new Set([]) }, html => html), 'baz')
equal(compile('<if foo is an empty set>baz</if>')({ foo: new Set([1, 2, 3, 4]) }, html => html), '')
equal(compile('<if foo is not an empty set>baz</if>')({ foo: new Set([1, 2, 3, 4]) }, html => html), 'baz')

equal(compile('<if foo is an empty map>baz</if>')({ foo: new Map([]) }, html => html), 'baz')
equal(compile('<if foo is an empty map>baz</if>')({ foo: new Map([ [{}, 'bar'] ]) }, html => html), '')
equal(compile('<if foo is not an empty map>baz</if>')({ foo: new Map([ [{}, 'bar'] ]) }, html => html), 'baz')

equal(compile('<if foo is an array>baz</if>')({ foo: [] }, html => html), 'baz')
equal(compile('<if foo is an array>baz</if>')({ foo: '' }, html => html), '')
equal(compile('<if foo is an array>baz</if>')({ foo: {} }, html => html), '')
equal(compile('<if foo is not an array>baz</if>')({ foo: [] }, html => html), '')
equal(compile('<if foo is not an array>baz</if>')({ foo: '' }, html => html), 'baz')
equal(compile('<if foo is not an array>baz</if>')({ foo: {} }, html => html), 'baz')

equal(compile('<if foo is a string>baz</if>')({ foo: '' }, html => html), 'baz')
equal(compile('<if foo is a string>baz</if>')({ foo: 'foo' }, html => html), 'baz')
equal(compile('<if foo is a string>baz</if>')({ foo: {} }, html => html), '')
equal(compile('<if foo is not a string>baz</if>')({ foo: '' }, html => html), '')
equal(compile('<if foo is not a string>baz</if>')({ foo: 'foo' }, html => html), '')
equal(compile('<if foo is not a string>baz</if>')({ foo: {} }, html => html), 'baz')

equal(compile('<if foo is a number>baz</if>')({ foo: [] }, html => html), '')
equal(compile('<if foo is a number>baz</if>')({ foo: 13 }, html => html), 'baz')
equal(compile('<if foo is a number>baz</if>')({ foo: {} }, html => html), '')
equal(compile('<if foo is not a number>baz</if>')({ foo: [] }, html => html), 'baz')
equal(compile('<if foo is not a number>baz</if>')({ foo: 13 }, html => html), '')
equal(compile('<if foo is not a number>baz</if>')({ foo: {} }, html => html), 'baz')

equal(compile('<if foo is a multiple of bar>baz</if>')({ foo: 100, bar: 10 }, html => html), 'baz')
equal(compile('<if foo is a multiple of bar>baz</if>')({ foo: 0, bar: 11 }, html => html), 'baz')
equal(compile('<if foo is a multiple of bar>baz</if>')({ foo: 42, bar: 9 }, html => html), '')
equal(compile('<if foo is not a multiple of bar>baz</if>')({ foo: 42, bar: 9 }, html => html), 'baz')

equal(compile('<if foo is numeric>baz</if>')({ foo: '-10' }, html => html), 'baz')
equal(compile('<if foo is numeric>baz</if>')({ foo: '0' }, html => html), 'baz')
equal(compile('<if foo is numeric>baz</if>')({ foo: '0xFF' }, html => html), 'baz')
equal(compile('<if foo is not numeric>baz</if>')({ foo: true }, html => html), 'baz')
equal(compile('<if foo is not numeric>baz</if>')({ foo: null }, html => html), 'baz')
equal(compile('<if foo is not numeric>baz</if>')({ foo: undefined }, html => html), 'baz')

equal(compile('<if foo is a symbol>baz</if>')({ foo: Symbol('foo') }, html => html), 'baz')
equal(compile('<if foo is a symbol>baz</if>')({ foo: {} }, html => html), '')
equal(compile('<if foo is not a symbol>baz</if>')({ foo: Symbol('foo') }, html => html), '')
equal(compile('<if foo is not a symbol>baz</if>')({ foo: {} }, html => html), 'baz')

equal(compile('<if foo is a map>baz</if>')({ foo: new Map() }, html => html), 'baz')
equal(compile('<if foo is a map>baz</if>')({ foo: {} }, html => html), '')
equal(compile('<if foo is a map>baz</if>')({ foo: [] }, html => html), '')
equal(compile('<if foo is not a map>baz</if>')({ foo: new Map() }, html => html), '')
equal(compile('<if foo is not a map>baz</if>')({ foo: {} }, html => html), 'baz')
equal(compile('<if foo is not a map>baz</if>')({ foo: [] }, html => html), 'baz')

equal(compile('<if foo is a weakmap>baz</if>')({ foo: new WeakMap() }, html => html), 'baz')
equal(compile('<if foo is a weakmap>baz</if>')({ foo: new WeakMap([ [{}, 'foo'], [{}, 'bar'] ]) }, html => html), 'baz')
equal(compile('<if foo is a weakmap>baz</if>')({ foo: new Map() }, html => html), '')
equal(compile('<if foo is not a weakmap>baz</if>')({ foo: new WeakMap() }, html => html), '')
equal(compile('<if foo is not a weakmap>baz</if>')({ foo: new WeakMap([ [{}, 'foo'], [{}, 'bar'] ]) }, html => html), '')
equal(compile('<if foo is not a weakmap>baz</if>')({ foo: new Map() }, html => html), 'baz')

equal(compile('<if foo is a set>baz</if>')({ foo: new Set() }, html => html), 'baz')
equal(compile('<if foo is a set>baz</if>')({ foo: {} }, html => html), '')
equal(compile('<if foo is a set>baz</if>')({ foo: [] }, html => html), '')
equal(compile('<if foo is not a set>baz</if>')({ foo: new Set() }, html => html), '')
equal(compile('<if foo is not a set>baz</if>')({ foo: {} }, html => html), 'baz')
equal(compile('<if foo is not a set>baz</if>')({ foo: [] }, html => html), 'baz')

equal(compile('<if foo is a weakset>baz</if>')({ foo: new WeakSet() }, html => html), 'baz')
equal(compile('<if foo is a weakset>baz</if>')({ foo: new WeakSet([ {} ]) }, html => html), 'baz')
equal(compile('<if foo is not a weakset>baz</if>')({ foo: new Set() }, html => html), 'baz')

equal(compile('<if foo is a boolean>baz</if>')({ foo: true }, html => html), 'baz')
equal(compile('<if foo is a boolean>baz</if>')({ foo: false }, html => html), 'baz')
equal(compile('<if foo is not a boolean>baz</if>')({ foo: true }, html => html), '')
equal(compile('<if foo is not a boolean>baz</if>')({ foo: '' }, html => html), 'baz')

equal(compile('<if foo is undefined>baz</if>')({ foo: undefined }, html => html), 'baz')
equal(compile('<if foo is undefined>baz</if>')({ foo: {} }, html => html), '')
equal(compile('<if foo is not undefined>baz</if>')({ foo: undefined }, html => html), '')
equal(compile('<if foo is not undefined>baz</if>')({ foo: null }, html => html), 'baz')
equal(compile('<if foo is not undefined>baz</if>')({ foo: {} }, html => html), 'baz')

equal(compile('<if foo is null>baz</if>')({ foo: null }, html => html), 'baz')
equal(compile('<if foo is not null>baz</if>')({ foo: null }, html => html), '')

equal(compile('<if foo is void>baz</if>')({ foo: undefined }, html => html), 'baz')
equal(compile('<if foo is void>baz</if>')({ foo: void 0 }, html => html), 'baz')
equal(compile('<if foo is null>baz</if>')({ foo: void 0 }, html => html), '')
equal(compile('<if foo is not void>baz</if>')({ foo: undefined }, html => html), '')
equal(compile('<if foo is not void>baz</if>')({ foo: void 0 }, html => html), '')
equal(compile('<if foo is not null>baz</if>')({ foo: void 0 }, html => html), 'baz')

equal(compile('<if foo is an object>baz</if>')({ foo: {} }, html => html), 'baz')
equal(compile('<if foo is an object>baz</if>')({ foo: null }, html => html), '')
equal(compile('<if foo is an object>baz</if>')({ foo: function () {} }, html => html), 'baz')
equal(compile('<if foo is not an object>baz</if>')({ foo: {} }, html => html), '')
equal(compile('<if foo is not an object>baz</if>')({ foo: null }, html => html), 'baz')
equal(compile('<if foo is not an object>baz</if>')({ foo: function () {} }, html => html), '')

equal(compile('<if foo is a regexp>baz</if>')({ foo: /regexp/ }, html => html), 'baz')
equal(compile('<if foo is a regexp>baz</if>')({ foo: new RegExp('regexp') }, html => html), 'baz')
equal(compile('<if foo is a regexp>baz</if>')({ foo: '' }, html => html), '')
equal(compile('<if foo is not a regexp>baz</if>')({ foo: /regexp/ }, html => html), '')
equal(compile('<if foo is not a regexp>baz</if>')({ foo: new RegExp('regexp') }, html => html), '')
equal(compile('<if foo is not a regexp>baz</if>')({ foo: '' }, html => html), 'baz')

equal(compile('<if foo is a regex>baz</if>')({ foo: /regex/ }, html => html), 'baz')
equal(compile('<if foo is a regex>baz</if>')({ foo: new RegExp('regex') }, html => html), 'baz')
equal(compile('<if foo is a regex>baz</if>')({ foo: '' }, html => html), '')
equal(compile('<if foo is not a regex>baz</if>')({ foo: /regex/ }, html => html), '')
equal(compile('<if foo is not a regex>baz</if>')({ foo: new RegExp('regex') }, html => html), '')
equal(compile('<if foo is not a regex>baz</if>')({ foo: '' }, html => html), 'baz')

equal(compile('<if foo is a date>baz</if>')({ foo: new Date() }, html => html), 'baz')
equal(compile('<if foo is a date>baz</if>')({ foo: new Date(2018, 15, 4) }, html => html), 'baz')
equal(compile('<if foo is a date>baz</if>')({ foo: '08.09.2018' }, html => html), '')
equal(compile('<if foo is not a date>baz</if>')({ foo: new Date() }, html => html), '')
equal(compile('<if foo is not a date>baz</if>')({ foo: new Date(2018, 15, 4) }, html => html), '')
equal(compile('<if foo is not a date>baz</if>')({ foo: '08.09.2018' }, html => html), 'baz')

equal(compile('<if foo is even>baz</if>')({ foo: 2 }, html => html), 'baz')
equal(compile('<if foo is even>baz</if>')({ foo: 0 }, html => html), 'baz')
equal(compile('<if foo is even>baz</if>')({ foo: 1 }, html => html), '')
equal(compile('<if foo is even>baz</if>')({ foo: 'baz' }, html => html), '')
equal(compile('<if foo is even>baz</if>')({ foo: [1, 2] }, html => html), '')
equal(compile('<if foo is even>baz</if>')({ foo: [1, 2].length }, html => html), 'baz')
equal(compile('<if foo is not even>baz</if>')({ foo: 2 }, html => html), '')
equal(compile('<if foo is not even>baz</if>')({ foo: 0 }, html => html), '')
equal(compile('<if foo is not even>baz</if>')({ foo: 1 }, html => html), 'baz')
equal(compile('<if foo is not even>baz</if>')({ foo: 'baz' }, html => html), 'baz')
equal(compile('<if foo is not even>baz</if>')({ foo: [1, 2] }, html => html), 'baz')
equal(compile('<if foo is not even>baz</if>')({ foo: [1, 2].length }, html => html), '')

equal(compile('<if foo is odd>baz</if>')({ foo: 1 }, html => html), 'baz')
equal(compile('<if foo is odd>baz</if>')({ foo: 2 }, html => html), '')
equal(compile('<if foo is odd>baz</if>')({ foo: [1].length }, html => html), 'baz')
equal(compile('<if foo is odd>baz</if>')({ foo: '' }, html => html), '')
equal(compile('<if foo is odd>baz</if>')({ foo: 'bar'.length }, html => html), 'baz')
equal(compile('<if foo is not odd>baz</if>')({ foo: 1 }, html => html), '')
equal(compile('<if foo is not odd>baz</if>')({ foo: 2 }, html => html), 'baz')
equal(compile('<if foo is not odd>baz</if>')({ foo: [1].length }, html => html), '')

equal(compile('<if foo bitwise or bar>baz</if>')({ foo: 0, bar: 0 }, html => html), '')
equal(compile('<if foo bitwise or bar>baz</if>')({ foo: 1, bar: 1 }, html => html), 'baz')
equal(compile('<if foo bitwise or bar>baz</if>')({ foo: 1, bar: 0 }, html => html), 'baz')
equal(compile('<if foo bitwise or bar>baz</if>')({ foo: 0, bar: 1 }, html => html), 'baz')
equal(compile('<if foo bitwise and bar>baz</if>')({ foo: 0, bar: 0 }, html => html), '')
equal(compile('<if foo bitwise and bar>baz</if>')({ foo: 1, bar: 1 }, html => html), 'baz')
equal(compile('<if foo bitwise and bar>baz</if>')({ foo: 1, bar: 0 }, html => html), '')
equal(compile('<if foo bitwise and bar>baz</if>')({ foo: 0, bar: 1 }, html => html), '')
equal(compile('<if foo bitwise xor bar>baz</if>')({ foo: 0, bar: 0 }, html => html), '')
equal(compile('<if foo bitwise xor bar>baz</if>')({ foo: 0, bar: 1 }, html => html), 'baz')
equal(compile('<if foo bitwise xor bar>baz</if>')({ foo: 1, bar: 0 }, html => html), 'baz')
equal(compile('<if foo bitwise xor bar>baz</if>')({ foo: 1, bar: 1 }, html => html), '')

equal(compile('<if not foo>baz</if>')({ foo: null }, html => html), 'baz')
equal(compile('<if not foo>baz</if>')({ foo: undefined }, html => html), 'baz')
equal(compile('<if not foo>baz</if>')({ foo: false }, html => html), 'baz')
equal(compile('<if not foo>baz</if>')({ foo: {} }, html => html), '')
equal(compile('<if not foo>baz</if>')({ foo: true }, html => html), '')
equal(compile('<if not foo.bar>baz</if>')({ foo: { bar: {} } }, html => html), '')
equal(compile('<if not foo.bar>baz</if>')({ foo: {} }, html => html), 'baz')

equal(compile('<if foo is a video>baz</if>')({ foo: 'foo.flv' }, html => html), 'baz')
equal(compile('<if foo is a video>baz</if>')({ foo: 'foo.mp3' }, html => html), '')
equal(compile('<if foo is a video>baz</if>')({ foo: 'fooflv' }, html => html), '')
equal(compile('<if foo is not a video>baz</if>')({ foo: 'fooflv' }, html => html), 'baz')

equal(compile('<if foo is an image>baz</if>')({ foo: 'foo.png' }, html => html), 'baz')
equal(compile('<if foo is an image>baz</if>')({ foo: 'foo.svg' }, html => html), 'baz')
equal(compile('<if foo is an image>baz</if>')({ foo: 'foobmp' }, html => html), '')
equal(compile('<if foo is not an image>baz</if>')({ foo: 'foobmp' }, html => html), 'baz')

equal(compile('<if foo is an audio>baz</if>')({ foo: 'foo.flac' }, html => html), 'baz')
equal(compile('<if foo is an audio>baz</if>')({ foo: 'foo.ogg' }, html => html), 'baz')
equal(compile('<if foo is an audio>baz</if>')({ foo: 'foomp3' }, html => html), '')
equal(compile('<if foo is not an audio>baz</if>')({ foo: 'foomp3' }, html => html), 'baz')

equal(compile('<if foo has an extension of bar>baz</if>')({ foo: 'foo.mp3', bar: 'mp3'}, html => html), 'baz')
equal(compile('<if foo has extension of={"jpg"}>baz</if>')({ foo: 'foo.jpg' }, html => html), 'baz')
equal(compile('<if foo has an extension of bar>baz</if>')({ foo: 'foo.mp3', bar: '.ogg'}, html => html), '')
equal(compile('<if foo does not have an extension of bar>baz</if>')({ foo: 'foo.mp3', bar: '.ogg'}, html => html), 'baz')

equal(compile('<ul><for todo in="{todos}"><li html="{todo.description}"></li></for></ul>')({
  todos: [
    { description: 'foo' },
    { description: 'bar' },
    { description: 'baz' },
    { description: 'qux' }
  ]
}), '<ul><li>foo</li><li>bar</li><li>baz</li><li>qux</li></ul>')

equal(compile('<ul><for foo in="{bar}"><for baz in="{foo.qux}"><li html="{baz}"></li></for></for></ul>')({
  bar: [
    { qux: [1, 2] },
    { qux: [3, 4] },
    { qux: [5, 6] }
  ]
}), '<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li></ul>')

equal(compile('<div>{42}</div>')({}, html => html), '<div>42</div>')
equal(compile('<div>{42} {42}</div>')({}, html => html), '<div>42 42</div>')
equal(compile('<div>{42} {foo}</div>')({
  foo: 'bar'
}, html => html), '<div>42 bar</div>')
equal(compile('<div>{"42"} {foo}</div>')({
  foo: 'bar'
}, html => html), '<div>42 bar</div>')
equal(compile('<div>{42 + 42}</div>')({
  foo: 'bar'
}, html => html), '<div>84</div>')
equal(compile('<div>1 + 2 = {1 + 2}</div>')({
  foo: 'bar'
}, html => html), '<div>1 + 2 = 3</div>')

equal(compile('<if foo has a whitespace>baz</if>')({ foo: 'foo&nbsp;bar' }, html => html), 'baz')
equal(compile('<if foo has a whitespace>baz</if>')({ foo: 'foobar' }, html => html), '')
equal(compile('<if foo has a whitespace>baz</if>')({ foo: '\n' }, html => html), 'baz')
equal(compile('<if foo has a whitespace>baz</if>')({ foo: '&nbsp;' }, html => html), 'baz')
equal(compile('<if foo does not have a whitespace>baz</if>')({ foo: 'foobar' }, html => html), 'baz')
equal(compile('<if foo does not have a whitespace>baz</if>')({ foo: ' foo bar ' }, html => html), '')

equal(compile('<if foo has a newline>baz</if>')({ foo: ' foo\nbar' }, html => html), 'baz')
equal(compile('<if foo has a newline>baz</if>')({ foo: ' foo\tbar' }, html => html), '')
equal(compile('<if foo does not have a newline>baz</if>')({ foo: 'foo\nbar' }, html => html), '')
equal(compile('<if foo does not have a newline>baz</if>')({ foo: ' foo\tbar' }, html => html), 'baz')

equal(compile('<if foo has a number>baz</if>')({ foo: { bar: 4 } }, html => html), 'baz')
equal(compile('<if foo has a number>baz</if>')({ foo: 'bar' }, html => html), '')
equal(compile('<if foo has a number>baz</if>')({ foo: { bar: '4' } }, html => html), '')
equal(compile('<if foo has a number>baz</if>')({ foo: [1, 2, 3] }, html => html), 'baz')
equal(compile('<if foo has a number>baz</if>')({ foo: [{}, 'bar', 'baz'] }, html => html), '')
equal(compile('<if foo has a number>baz</if>')({ foo: [{}, 4, 'bar'] }, html => html), 'baz')
equal(compile('<if foo has a number>baz</if>')({ foo: 4 }, html => html), 'baz')
equal(compile('<if foo does not have a number>baz</if>')({ foo: 4 }, html => html), '')
equal(compile('<if foo does not have a number>baz</if>')({ foo: { bar: 4 } }, html => html), '')
equal(compile('<if foo does not have a number>baz</if>')({ foo: 'bar' }, html => html), 'baz')
equal(compile('<if foo does not have a number>baz</if>')({ foo: { bar: '4' } }, html => html), 'baz')
equal(compile('<if foo does not have a number>baz</if>')({ foo: [{}, 4, 'bar'] }, html => html), '')

equal(compile('<if foo has numbers>baz</if>')({ foo: { bar: 100 } }, html => html), '')
equal(compile('<if foo has numbers>baz</if>')({ foo: ['bar', 'baz', 'ban'] }, html => html), '')
equal(compile('<if foo has numbers>baz</if>')({ foo: [1, 2, 3] }, html => html), 'baz')
equal(compile('<if foo has numbers>baz</if>')({ foo: [1, 4, 'bar'] }, html => html), 'baz')
equal(compile('<if foo does not have numbers>baz</if>')({ foo: ['bar', 'baz', 'ban'] }, html => html), 'baz')
equal(compile('<if foo does not have numbers>baz</if>')({ foo: { bar: 100 } }, html => html), 'baz')

equal(compile('<if foo is true>baz</if>')({ foo: true }, html => html), 'baz')
equal(compile('<if foo is true>baz</if>')({ foo: {} }, html => html), 'baz')
equal(compile('<if foo is true>baz</if>')({ foo: [] }, html => html), 'baz')
equal(compile('<if foo is true>baz</if>')({ foo: false }, html => html), '')
equal(compile('<if foo is true>baz</if>')({ foo: 0 }, html => html), '')
equal(compile('<if foo is true>baz</if>')({ foo: null }, html => html), '')
equal(compile('<if foo is true>baz</if>')({ foo: undefined }, html => html), '')
equal(compile('<if foo is true>baz</if>')({ foo: '' }, html => html), '')
equal(compile('<if foo is true>baz</if>')({ foo: NaN }, html => html), '')
equal(compile('<if foo is not true>baz</if>')({ foo: false }, html => html), 'baz')
equal(compile('<if foo is not true>baz</if>')({ foo: 'bar' }, html => html), '')

equal(compile('<if foo is truthy>baz</if>')({ foo: true }, html => html), 'baz')
equal(compile('<if foo is truthy>baz</if>')({ foo: {} }, html => html), 'baz')
equal(compile('<if foo is truthy>baz</if>')({ foo: [] }, html => html), 'baz')
equal(compile('<if foo is truthy>baz</if>')({ foo: false }, html => html), '')
equal(compile('<if foo is truthy>baz</if>')({ foo: 0 }, html => html), '')
equal(compile('<if foo is truthy>baz</if>')({ foo: null }, html => html), '')
equal(compile('<if foo is truthy>baz</if>')({ foo: undefined }, html => html), '')
equal(compile('<if foo is truthy>baz</if>')({ foo: '' }, html => html), '')
equal(compile('<if foo is truthy>baz</if>')({ foo: NaN }, html => html), '')
equal(compile('<if foo is not truthy>baz</if>')({ foo: false }, html => html), 'baz')
equal(compile('<if foo is not truthy>baz</if>')({ foo: 'bar' }, html => html), '')

equal(compile('<if foo is false>baz</if>')({ foo: false }, html => html), 'baz')
equal(compile('<if foo is false>baz</if>')({ foo: 0 }, html => html), 'baz')
equal(compile('<if foo is false>baz</if>')({ foo: null }, html => html), 'baz')
equal(compile('<if foo is false>baz</if>')({ foo: undefined }, html => html), 'baz')
equal(compile('<if foo is false>baz</if>')({ foo: '' }, html => html), 'baz')
equal(compile('<if foo is false>baz</if>')({ foo: NaN }, html => html), 'baz')
equal(compile('<if foo is false>baz</if>')({ foo: true }, html => html), '')
equal(compile('<if foo is false>baz</if>')({ foo: {} }, html => html), '')
equal(compile('<if foo is false>baz</if>')({ foo: [] }, html => html), '')
equal(compile('<if foo is not false>baz</if>')({ foo: true }, html => html), 'baz')
equal(compile('<if foo is not false>baz</if>')({ foo: 'bar' }, html => html), 'baz')

equal(compile('<if foo is falsy>baz</if>')({ foo: false }, html => html), 'baz')
equal(compile('<if foo is falsy>baz</if>')({ foo: 0 }, html => html), 'baz')
equal(compile('<if foo is falsy>baz</if>')({ foo: null }, html => html), 'baz')
equal(compile('<if foo is falsy>baz</if>')({ foo: undefined }, html => html), 'baz')
equal(compile('<if foo is falsy>baz</if>')({ foo: '' }, html => html), 'baz')
equal(compile('<if foo is falsy>baz</if>')({ foo: NaN }, html => html), 'baz')
equal(compile('<if foo is falsy>baz</if>')({ foo: true }, html => html), '')
equal(compile('<if foo is falsy>baz</if>')({ foo: {} }, html => html), '')
equal(compile('<if foo is falsy>baz</if>')({ foo: [] }, html => html), '')
equal(compile('<if foo is not falsy>baz</if>')({ foo: true }, html => html), 'baz')
equal(compile('<if foo is not falsy>baz</if>')({ foo: 'bar' }, html => html), 'baz')

equal(compile('<if foo is divisible by bar>baz</if>')({ foo: 10, bar: 5 }, html => html), 'baz')
equal(compile('<if foo is not divisible by bar>baz</if>')({ foo: 5, bar: 10 }, html => html), 'baz')
equal(compile('<if foo is divisible by="{10}">baz</if>')({ foo: 10 }, html => html), 'baz')
equal(compile('<if foo is not divisible by="{10}">baz</if>')({ foo: 5 }, html => html), 'baz')
equal(compile('<if foo is divisible by={bar}>baz</if>')({ foo: 10, bar: 5 }, html => html), 'baz')
equal(compile('<if foo is not divisible by={bar}>baz</if>')({ foo: 5, bar: 10 }, html => html), 'baz')
equal(compile('<if foo is divisible by five>baz</if>')({ foo: 10 }, html => html), 'baz')
equal(compile('<if foo is divisible by five>baz</if>')({ foo: 6 }, html => html), '')
equal(compile('<if foo is not divisible by five>baz</if>')({ foo: 6 }, html => html), 'baz')

equal(compile('<if foo is prime>baz</if>')({ foo: 3 }, html => html), 'baz')
equal(compile('<if foo is prime>baz</if>')({ foo: 5 }, html => html), 'baz')
equal(compile('<if foo is prime>baz</if>')({ foo: 1 }, html => html), '')
equal(compile('<if foo is not prime>baz</if>')({ foo: 1 }, html => html), 'baz')

equal(compile('<if foo is a palindrome>baz</if>')({ foo: 'madam' }, html => html), 'baz')
equal(compile('<if foo is a palindrome>baz</if>')({ foo: 'foo' }, html => html), '')
equal(compile('<if foo is not a palindrome>baz</if>')({ foo: 'foo' }, html => html), 'baz')

equal(compile('<if foo is sooner than bar>baz</if>')({
  foo: new Date(2018, 4, 1),
  bar: new Date(2018, 4, 29)
}, html => html), 'baz')

equal(compile('<if foo is sooner than bar>baz</if>')({
  foo: new Date(2018, 4, 29),
  bar: new Date(2018, 4, 11)
}, html => html), '')

equal(compile('<if foo is not sooner than bar>baz</if>')({
  foo: new Date(2018, 4, 29),
  bar: new Date(2018, 4, 11)
}, html => html), 'baz')

equal(compile('<if foo is later than bar>baz</if>')({
  foo: new Date(2018, 4, 29),
  bar: new Date(2018, 4, 11)
}, html => html), 'baz')

equal(compile('<if foo is later than bar>baz</if>')({
  foo: new Date(2018, 4, 1),
  bar: new Date(2018, 4, 29)
}, html => html), '')

equal(compile('<if foo is not later than bar>baz</if>')({
  foo: new Date(2018, 4, 1),
  bar: new Date(2018, 4, 29)
}, html => html), 'baz')

equal(compile('<if foo is before bar>baz</if>')({
  foo: new Date(2018, 5, 27),
  bar: new Date(2018, 5, 29)
}, html => html), 'baz')

equal(compile('<if foo is before bar>baz</if>')({
  foo: new Date(2018, 5, 29),
  bar: new Date(2018, 5, 27)
}, html => html), '')

equal(compile('<if foo is not before bar>baz</if>')({
  foo: new Date(2018, 5, 29),
  bar: new Date(2018, 5, 27)
}, html => html), 'baz')

equal(compile('<if foo is after bar>baz</if>')({
  foo: new Date(2018, 5, 29),
  bar: new Date(2018, 5, 27)
}, html => html), 'baz')

equal(compile('<if foo is after bar>baz</if>')({
  foo: new Date(2018, 5, 27),
  bar: new Date(2018, 5, 29)
}, html => html), '')

equal(compile('<if foo is not after bar>baz</if>')({
  foo: new Date(2018, 5, 27),
  bar: new Date(2018, 5, 29)
}, html => html), 'baz')

equal(compile('<if foo is a digit>baz</if>')({ foo: 0 }, html => html), 'baz')
equal(compile('<if foo is a digit>baz</if>')({ foo: 7 }, html => html), 'baz')
equal(compile('<if foo is a digit>baz</if>')({ foo: 10 }, html => html), '')
equal(compile('<if foo is not a digit>baz</if>')({ foo: 10 }, html => html), 'baz')

equal(compile('<if foo is decimal>baz</if>')({ foo: 2.01 }, html => html), 'baz')
equal(compile('<if foo is decimal>baz</if>')({ foo: 1.11 }, html => html), 'baz')
equal(compile('<if foo is decimal>baz</if>')({ foo: 2.00 }, html => html), '')
equal(compile('<if foo is decimal>baz</if>')({ foo: 1 }, html => html), '')
equal(compile('<if foo is not decimal>baz</if>')({ foo: 10 }, html => html), 'baz')

equal(compile('<if foo is frozen>baz</if>')({ foo: Object.freeze({}) }, html => html), 'baz')
equal(compile('<if foo is frozen>baz</if>')({ foo: {} }, html => html), '')
equal(compile('<if foo is not frozen>baz</if>')({ foo: {} }, html => html), 'baz')

equal(compile('<if foo is sealed>baz</if>')({ foo: Object.seal({}) }, html => html), 'baz')
equal(compile('<if foo is sealed>baz</if>')({ foo: {} }, html => html), '')
equal(compile('<if foo is not sealed>baz</if>')({ foo: {} }, html => html), 'baz')

equal(compile('<if foo eq="bar">baz</if>')({ foo: 'bar' }, html => html), 'baz')
equal(compile('<if foo eq="bar">baz</if>')({ foo: 'baz' }, html => html), '')

equal(compile('<if foo eq="{bar}">baz</if>')({ foo: 'qux', bar: 'qux' }, html => html), 'baz')
equal(compile('<if foo eq="{bar}">baz</if>')({ foo: 'qux', bar: 'quuux' }, html => html), '')
equal(compile('<if foo eq="{bar}">baz</if>')({ foo: 10, bar: 10 }, html => html), 'baz')
equal(compile('<if foo eq="{bar}">baz</if>')({ foo: 10, bar: 0 }, html => html), '')
equal(compile('<if foo eq="{bar}">baz</if>')({ foo: null, bar: null }, html => html), 'baz')
equal(compile('<if foo eq="{bar}">baz</if>')({ foo: {}, bar: {} }, html => html), '')

equal(compile('<if foo eq="{10}">baz</if>')({ foo: 10 }, html => html), 'baz')
equal(compile('<if foo eq="{100 + 100}">baz</if>')({ foo: 200 }, html => html), 'baz')
equal(compile('<if foo eq="{100 + 100 + 0}">baz</if>')({ foo: 200 }, html => html), 'baz')
equal(compile('<if foo eq="{bar}">baz</if>')({ foo: 10, bar: 10 }, html => html), 'baz')
equal(compile('<if foo eq="{bar}">baz</if>')({ foo: 10, bar: 0 }, html => html), '')

equal(compile('<if foo starts with bar>baz</if>')({ foo: 'ban qux', bar: 'ban' }, html => html), 'baz')
equal(compile('<if foo starts with bar>baz</if>')({ foo: 'ban qux', bar: 'qux' }, html => html), '')
equal(compile('<if foo does not start with bar>baz</if>')({ foo: 'ban qux', bar: 'qux' }, html => html), 'baz')

equal(compile('<if foo ends with bar>baz</if>')({ foo: 'ban qux', bar: 'qux' }, html => html), 'baz')
equal(compile('<if foo ends with bar>baz</if>')({ foo: 'ban qux', bar: 'baz' }, html => html), '')
equal(compile('<if foo does not end with bar>baz</if>')({ foo: 'ban qux', bar: 'baz' }, html => html), 'baz')

equal(compile('<div html="{foo(bar())}"></div>')({ foo: string => string, bar: () => 'bar' }, html => html), '<div>bar</div>')
equal(compile('<div text="{foo(bar())}"></div>')({ foo: string => string, bar: () => 'bar' }, html => html), '<div>bar</div>')

equal(compile('<for number in range="0...10">{number}</for>')({}, html => html), '0123456789')
equal(compile('<for number in range="0..10">{number}</for>')({}, html => html), '012345678910')
equal(compile('<for number in range="10">{number}</for>')({}, html => html), '012345678910')

equal(compile('{foo + 1}')({ foo: 0 }, html => html), '1')
equal(compile('{1 + foo}')({ foo: 0 }, html => html), '1')
equal(compile('{foo + bar}')({ foo: 0, bar: 1 }, html => html), '1')
equal(compile('{foo + bar}')({
  foo: '<script>alert("foo")</script>',
  bar: 'hello'
}, html => html.replace(/</g, '&lt;').replace(/>/g, '&gt;')), '&lt;script&gt;alert("foo")&lt;/script&gt;hello')
equal(compile('{foo + bar + baz}')({ foo: 0, bar: 1, baz: 2 }, html => html), '3')
equal(compile('{foo() + 1}')({ foo: () => 0 }, html => html), '1')
equal(compile('{foo() + bar() + 2}')({ foo: () => 0, bar: () => 1 }, html => html), '3')
equal(compile('{foo() + bar() + baz()}')({ foo: () => 0, bar: () => 1, baz: () => 2 }, html => html), '3')
equal(compile('{foo() + bar + 2}')({ foo: () => 0, bar: 1 }, html => html), '3')
equal(compile('{foo(bar) + baz}')({ foo: (bar) => bar, bar: 2, baz: 1 }, html => html), '3')
equal(compile('{"&"}')({}, html => html.replace(/&/g, '&amp;')), '&')
equal(compile('<h5>#{index + 1} {translate("blog.author")}: {author}</h5>')(
  { index: 0, translate: () => 'author', author: 'Olek' }, html => html), '<h5>#1 author: Olek</h5>')
equal(compile('{foo + 1}')({ foo: 1  }, html => html), '2')
equal(compile('{foo.bar + 1}')({ foo: { bar: 1 } }, html => html), '2')
equal(compile('<switch foo><case is present>bar</case></switch>')({ foo: true }, html => html), 'bar')
equal(compile('<switch foo><case is present>bar</case></switch>')({ foo: undefined }, html => html), '')
equal(compile('<switch foo><case is undefined>bar</case></switch>')({}, html => html), 'bar')
equal(compile('<switch foo><case is undefined>bar</case></switch>')({ foo: 'hello' }, html => html), '')
equal(compile('<switch foo><case is present>bar</case><case is undefined>baz</case></switch>')({ foo: 'hello' }, html => html), 'bar')
equal(compile('<switch foo><case is present>bar</case><case is undefined>baz</case></switch>')({ foo: undefined }, html => html), 'baz')
equal(compile('<switch foo><case is positive>bar</case><case is negative>baz</case></switch>')({ foo: 100 }, html => html), 'bar')
equal(compile('<switch foo><case is positive>bar</case><case is negative>baz</case></switch>')({ foo: -100 }, html => html), 'baz')
equal(compile('<switch foo><case is positive>bar</case><case is negative>baz</case><default>qux</default></switch>')({ foo: 100 }, html => html), 'bar')
equal(compile('<switch foo><case is positive>bar</case><case is negative>baz</case><default>qux</default></switch>')({ foo: -100 }, html => html), 'baz')
equal(compile('<switch foo><case is positive>bar</case><case is negative>baz</case><default>qux</default></switch>')({ foo: 0 }, html => html), 'qux')
equal(compile('<foreach foo in bar>{foo}</foreach>')({ bar: [1, 2, 3] }, html => html), '123')

equal(compile('<foreach foo and baz in bar>{foo}{baz}</foreach>')({
  bar: new Map([ ['qux', 1], ['quux', 2] ])
}, html => html), '1qux2quux')

equal(compile('<foreach foo in bar>{foo}</foreach>')({
  bar: new Set([1, 2, 3, 4, 5])
}, html => html), '12345')

equal(compile('<button>{translate("buttons.search")}&nbsp;<span class="fa fa-search"></span></button>')({ translate () { return 'foo' } }, html => html), '<button>foo&nbsp;<span class="fa fa-search"></span></button>')
equal(compile(`<for month in='{["Styczeń", "Luty", "Marzec"]}'>{month}</for>`)({}, html => html), 'StyczeńLutyMarzec')
equal(compile(`<for foo in='{[bar, baz]}'>{foo}</for>`)({ bar: 'bar', baz: 'baz' }, html => html), 'barbaz')
// equal(compile(`<for foo in='{[{ key: 'bar' }, { key: 'baz' }]}'>{foo.key}</for>`)({}, html => html), 'barbaz')

equal(compile(`{foo.bar}<rescue>baz</rescue>`)({}, html => html), 'baz')
equal(compile(`{foo.bar}<rescue>baz</rescue>`)({ foo: { bar: 'qux' } }, html => html), 'qux')

equal(compile(`{baz}<for foo in bar><for baz in foo>{baz.quz}</for></for>{baz}`)({
  bar: [ [{ quz: 1 }], [{ quz: 2 }] ],
  baz: 'qux'
}, html => html), 'qux12qux')

equal(compile(`{baz}<for foo in bar><for baz in foo.quz>{baz}</for></for>{baz}`)({
  bar: [ { quz: [1, 2, 3] }, { quz: [4, 5, 6] } ],
  baz: 'qux'
}, html => html), 'qux123456qux')

equal(compile(`<each foo in bar>{foo}</each>`)({
  bar: {
    each: function (callback) {
      const elements = [1, 2, 3]
      elements.forEach(callback)
    }
  }
}, html => html), '123')

equal(compile('<if foo and bar and baz>qux</if>')({ foo: true, bar: true, baz: true }, html => html), 'qux')
equal(compile('<if foo and bar and baz>qux</if>')({ foo: false, bar: true, baz: true }, html => html), '')
equal(compile('<if foo and bar and baz>qux</if>')({ foo: true, bar: true, baz: false }, html => html), '')
equal(compile('<if foo and bar and baz>qux</if>')({ foo: false, bar: true, baz: false }, html => html), '')

equal(compile('<if foo and bar and baz and ban>qux</if>')({ foo: true, bar: true, baz: true, ban: true }, html => html), 'qux')
equal(compile('<if foo and bar and baz and ban>qux</if>')({ foo: false, bar: true, baz: true, ban: true }, html => html), '')
equal(compile('<if foo and bar and baz and ban>qux</if>')({ foo: false, bar: false, baz: false, ban: false }, html => html), '')
equal(compile('<if foo and bar and baz and ban>qux</if>')({ foo: true, bar: true, baz: true, ban: false }, html => html), '')

equal(compile('<if foo and bar equals baz>qux</if>')({ foo: true, bar: 'baz', baz: 'baz' }, html => html), 'qux')
equal(compile('<if foo and bar equals baz>qux</if>')({ foo: false, bar: 'baz', baz: 'baz' }, html => html), '')
equal(compile('<if foo and bar equals baz>qux</if>')({ foo: true, bar: 'baz', baz: 'ban' }, html => html), '')

equal(compile('<if foo and bar equals="baz">qux</if>')({ foo: true, bar: 'baz' }, html => html), 'qux')
equal(compile('<if foo and bar equals="{baz}">qux</if>')({ foo: true, bar: 'baz', baz: 'baz' }, html => html), 'qux')

equal(compile('<if foo is divisible by three and foo is divisible by five>bar</if>')({ foo: 15 }, html => html), 'bar')
equal(compile('<if foo is divisible by three and foo is divisible by five>bar</if>')({ foo: 14 }, html => html), '')
equal(compile('<if foo is divisible by three or foo is divisible by five>bar</if>')({ foo: 12 }, html => html), 'bar')
equal(compile('<if foo is divisible by three or foo is divisible by five>bar</if>')({ foo: 10 }, html => html), 'bar')
equal(compile('<if foo is divisible by three or foo is divisible by five>bar</if>')({ foo: 8 }, html => html), '')

equal(compile('<if foo includes bar>baz</if>')({ foo: 'lorem ipsum', bar: 'ipsum' }, html => html), 'baz')
equal(compile('<if foo includes bar>baz</if>')({ foo: 'lorem ipsum', bar: 'dolor' }, html => html), '')
equal(compile('<if foo includes bar>baz</if>')({ foo: ['lorem', 'ipsum'], bar: 'ipsum' }, html => html), 'baz')
equal(compile('<if foo includes bar>baz</if>')({ foo: ['lorem', 'ipsum'], bar: 'dolor' }, html => html), '')
equal(compile('<if foo does not include={"dolor"}>baz</if>')({ foo: ['lorem', 'ipsum'] }, html => html), 'baz')

equal(compile('<if foo contains={"ipsum"}>baz</if>')({ foo: ['lorem', 'ipsum'] }, html => html), 'baz')
equal(compile('<if foo contains={"dolor"}>baz</if>')({ foo: ['lorem', 'ipsum'] }, html => html), '')
equal(compile('<if foo does not contain={"dolor"}>baz</if>')({ foo: ['lorem', 'ipsum'] }, html => html), 'baz')
equal(compile('<if foo contains={"ipsum"}>baz</if>')({ foo: 'lorem ipsum' }, html => html), 'baz')
equal(compile('<if foo contains={"dolor"}>baz</if>')({ foo: 'lorem ipsum' }, html => html), '')

equal(compile('<if foo matches bar>baz</if>')({ foo: 'lorem ipsum', bar: /ipsum/ }, html => html), 'baz')
equal(compile('<if foo matches bar>baz</if>')({ foo: 'lorem ipsum', bar: /dolor/ }, html => html), '')
equal(compile('<if foo does not match bar>baz</if>')({ foo: 'lorem ipsum', bar: /dolor/ }, html => html), 'baz')

equal(compile('<if not foo and bar>baz</if>')({ foo: false, bar: true }, html => html), 'baz')
equal(compile('<if not foo and bar>baz</if>')({ foo: true, bar: false }, html => html), '')
equal(compile('<if not foo and bar>baz</if>')({ foo: false, bar: false }, html => html), '')
equal(compile('<if not foo and bar>baz</if>')({ foo: true, bar: true }, html => html), '')

equal(compile('<if foo is positive and bar>baz</if>')({ foo: 10, bar: true }, html => html), 'baz')
equal(compile('<if foo is positive and bar>baz</if>')({ foo: -10, bar: true }, html => html), '')
equal(compile('<if foo is positive and bar>baz</if>')({ foo: 10, bar: false }, html => html), '')
equal(compile('<if foo is positive and bar>baz</if>')({ foo: -10, bar: false }, html => html), '')

equal(compile('<if foo is not positive and bar>baz</if>')({ foo: 10, bar: true }, html => html), '')
equal(compile('<if foo is not positive and bar>baz</if>')({ foo: -10, bar: true }, html => html), 'baz')
equal(compile('<if foo is not positive and bar>baz</if>')({ foo: 10, bar: false }, html => html), '')
equal(compile('<if foo is not positive and bar>baz</if>')({ foo: -10, bar: false }, html => html), '')

equal(compile('<if foo is not positive and not bar>baz</if>')({ foo: 10, bar: true }, html => html), '')
equal(compile('<if foo is not positive and not bar>baz</if>')({ foo: -10, bar: true }, html => html), '')
equal(compile('<if foo is not positive and not bar>baz</if>')({ foo: 10, bar: false }, html => html), '')
equal(compile('<if foo is not positive and not bar>baz</if>')({ foo: -10, bar: false }, html => html), 'baz')

equal(compile('<if foo and not bar>baz</if>')({ foo: false, bar: true }, html => html), '')
equal(compile('<if foo and not bar>baz</if>')({ foo: true, bar: false }, html => html), 'baz')
equal(compile('<if foo and not bar>baz</if>')({ foo: false, bar: false }, html => html), '')
equal(compile('<if foo and not bar>baz</if>')({ foo: true, bar: true }, html => html), '')

equal(compile('<if foo responds to={"bar"}>baz</if>')({ foo: { bar () {} } }, html => html), 'baz')
equal(compile('<if foo responds to bar>baz</if>')({ foo: { bar () {} }, bar: 'bar' }, html => html), 'baz')
equal(compile('<if foo responds to bar>baz</if>')({ foo: { bar: [] }, bar: 'bar' }, html => html), '')
equal(compile('<if foo does not respond to bar>baz</if>')({ foo: { bar: [] }, bar: 'bar' }, html => html), 'baz')

equal(compile('<for key and value in foo>{key}{value}</for>')({ foo: { bar: 'baz', ban: 'qux' } }, html => html), 'barbazbanqux')
equal(compile('<for key and value in="{foo}">{key}{value}</for>')({ foo: { bar: 'baz', ban: 'qux' } }, html => html), 'barbazbanqux')

equal(compile('<style></style>')({}, html => html), '<style></style>')
equal(compile('<script></script>')({}, html => html), '<script></script>')
equal(compile('<template></template>')({}, html => html), '<template></template>')

equal(compile('<style>.foo{color:red}</style>')({}, html => html), '<style>.foo{color:red}</style>')
equal(compile('<script>console.log({ foo: "bar" })</script>')({}, html => html), '<script>console.log({ foo: "bar" })</script>')
equal(compile('<template><div></div></template>')({}, html => html), '<template><div></div></template>')
equal(compile('<template><div>{}</div></template>')({}, html => html), '<template><div>{}</div></template>')
equal(compile('<script type="text/javascript" src="./main.js"></script>')({}, html => html), '<script type="text/javascript" src="./main.js"></script>')
equal(compile('<style type="text/css">.foo{color:red}</style>')({}, html => html), '<style type="text/css">.foo{color:red}</style>')

equal(compile('<if foo bitwise and bar or baz>baz</if>')({ foo: 1, bar: 1, baz: 0 }, html => html), 'baz')
equal(compile('<if foo bitwise and bar or baz>baz</if>')({ foo: 0, bar: 0, baz: 0 }, html => html), '')

equal(compile('<if foo is an email>baz</if>')({ foo: 'as@ts.eu' }, html => html), 'baz')
equal(compile('<if foo is an email>baz</if>')({ foo: 'asts.eu' }, html => html), '')

equal(compile('<if foo have more than one element>baz</if>')({ foo: [1, 2, 3, 4, 5] }, html => html), 'baz')
equal(compile('<if foo have more than four item>baz</if>')({ foo: [1, 2, 3, 4, 5] }, html => html), 'baz')
equal(compile('<if photos have more than two photo>baz</if>')({ photos: [{}, {}] }, html => html), '')
equal(compile('<if photos do not have more than two photo>baz</if>')({ photos: [{}, {}] }, html => html), 'baz')

equal(compile('<if foo have less than six element>baz</if>')({ foo: [1, 2, 3, 4, 5] }, html => html), 'baz')
equal(compile('<if photos have less than two photo>baz</if>')({ photos: [{}, {}] }, html => html), '')
equal(compile('<if photos do not have less than two photo>baz</if>')({ photos: [{}, {}] }, html => html), 'baz')

equal(compile('<if photos have two photo>baz</if>')({ photos: [{}, {}] }, html => html), 'baz')
equal(compile('<if photos have zero photo>baz</if>')({ photos: [] }, html => html), 'baz')
equal(compile('<if photos have one photo>baz</if>')({ photos: [] }, html => html), '')
equal(compile('<if photos do not have one photo>baz</if>')({ photos: [] }, html => html), 'baz')

equal(compile('<if photos have many pictures>baz</if>')({ photos: [{}, {}] }, html => html), 'baz')
equal(compile('<if photos have many pictures>baz</if>')({ photos: [{}] }, html => html), '')
equal(compile('<if photos do not have many pictures>baz</if>')({ photos: [{}] }, html => html), 'baz')

equal(compile('<if photos have elements>baz</if>')({ photos: [{}, {}] }, html => html), 'baz')
equal(compile('<if photos have elements>baz</if>')({ photos: [{}] }, html => html), 'baz')
equal(compile('<if photos have elements>baz</if>')({ photos: [] }, html => html), '')
equal(compile('<if photos do not have elements>baz</if>')({ photos: [] }, html => html), 'baz')

equal(compile('<if foo has more than one element>baz</if>')({ foo: [1, 2, 3, 4, 5] }, html => html), 'baz')
equal(compile('<if foo has more than four item>baz</if>')({ foo: [1, 2, 3, 4, 5] }, html => html), 'baz')
equal(compile('<if photo has more than two picture>baz</if>')({ photo: [{}, {}] }, html => html), '')
equal(compile('<if photo does not have more than two picture>baz</if>')({ photo: [{}, {}] }, html => html), 'baz')

equal(compile('<if foo has less than six element>baz</if>')({ foo: [1, 2, 3, 4, 5] }, html => html), 'baz')
equal(compile('<if photo has less than two item>baz</if>')({ photo: [{}, {}] }, html => html), '')
equal(compile('<if photo does not have less than two item>baz</if>')({ photo: [{}, {}] }, html => html), 'baz')

equal(compile('<if photo has two element>baz</if>')({ photo: [{}, {}] }, html => html), 'baz')
equal(compile('<if photo has zero item>baz</if>')({ photo: [] }, html => html), 'baz')
equal(compile('<if photo has one picture>baz</if>')({ photo: [] }, html => html), '')
equal(compile('<if photo does not have one element>baz</if>')({ photo: [] }, html => html), 'baz')

equal(compile('<if photo has many pictures>baz</if>')({ photo: [{}, {}] }, html => html), 'baz')
equal(compile('<if photo has many pictures>baz</if>')({ photo: [{}] }, html => html), '')
equal(compile('<if photo does not have many pictures>baz</if>')({ photo: [{} ] }, html => html), 'baz')

equal(compile('<if foo has items>baz</if>')({ foo: [{}, {}] }, html => html), 'baz')
equal(compile('<if foo has items>baz</if>')({ foo: [{}] }, html => html), 'baz')
equal(compile('<if foo has items>baz</if>')({ foo: [] }, html => html), '')
equal(compile('<if foo does not have items>baz</if>')({ foo: [] }, html => html), 'baz')

equal(compile('<if foo is between bar and baz>baz</if>')({ foo: 15, bar: 10, baz: 20 }, html => html), 'baz')
equal(compile('<if foo is between bar and baz>baz</if>')({ foo: 10, bar: 10, baz: 20 }, html => html), 'baz')
equal(compile('<if foo is between bar and baz>baz</if>')({ foo: 20, bar: 10, baz: 20 }, html => html), 'baz')
equal(compile('<if foo is between bar and baz>baz</if>')({ foo: 50, bar: 10, baz: 20 }, html => html), '')
equal(compile('<if foo is not between bar and baz>baz</if>')({ foo: 50, bar: 10, baz : 20}, html => html), 'baz')
equal(compile('<if foo is between one and ten>baz</if>')({ foo: 10 }, html => html), 'baz')
equal(compile('<if foo is between six and nine>baz</if>')({ foo: 5 }, html => html), '')
equal(compile('<if foo is not between six and nine>baz</if>')({ foo: 5 }, html => html), 'baz')

equal(compile('<if foo is between bar and baz and qux>baz</if>')({ foo: 15, bar: 10, baz: 20, qux: true }, html => html), 'baz')
equal(compile('<if foo is between bar and baz and qux>baz</if>')({ foo: 10, bar: 10, baz: 20, qux: false }, html => html), '')
equal(compile('<if foo is not between bar and baz and qux>baz</if>')({ foo: 0, bar: 10, baz: 20, qux: true }, html => html), 'baz')

equal(compile('<if foo is below bar>baz</if>')({ foo: 5, bar: 10 }, html => html), 'baz')
equal(compile('<if foo is below bar>baz</if>')({ foo: 20, bar: 20 }, html => html), '')
equal(compile('<if foo is below six>baz</if>')({ foo: 5 }, html => html), 'baz')
equal(compile('<if foo is below three>baz</if>')({ foo: 5 }, html => html), '')
equal(compile('<if foo is not below three>baz</if>')({ foo: 5 }, html => html), 'baz')
equal(compile('<if foo is not below bar>baz</if>')({ foo: 20, bar: 20 }, html => html), 'baz')

equal(compile('<if foo is above bar>baz</if>')({ foo: 15, bar: 10 }, html => html), 'baz')
equal(compile('<if foo is above bar>baz</if>')({ foo: 20, bar: 20 }, html => html), '')
equal(compile('<if foo is above two>baz</if>')({ foo: 5 }, html => html), 'baz')
equal(compile('<if foo is above nine>baz</if>')({ foo: 5 }, html => html), '')
equal(compile('<if foo is not above bar>baz</if>')({ foo: 20, bar: 20 }, html => html), 'baz')
equal(compile('<if foo is not above nine>baz</if>')({ foo: 5 }, html => html), 'baz')

equal(compile('<if foo is at least bar>baz</if>')({ foo: 20, bar: 20 }, html => html), 'baz')
equal(compile('<if foo is at least four>baz</if>')({ foo: 5 }, html => html), 'baz')
equal(compile('<if foo is at least bar>baz</if>')({ foo: 10, bar: 20 }, html => html), '')
equal(compile('<if foo is at least eight>baz</if>')({ foo: 5 }, html => html), '')
equal(compile('<if foo is not at least bar>baz</if>')({ foo: 10, bar: 20 }, html => html), 'baz')
equal(compile('<if foo is not at least eight>baz</if>')({ foo: 5 }, html => html), 'baz')

equal(compile('<if foo is at most bar>baz</if>')({ foo: 20, bar: 20 }, html => html), 'baz')
equal(compile('<if foo is at most bar>baz</if>')({ foo: 30, bar: 20 }, html => html), '')
equal(compile('<if foo is not at most bar>baz</if>')({ foo: 30, bar: 20 }, html => html), 'baz')
equal(compile('<if foo is at most eight>baz</if>')({ foo: 6 }, html => html), 'baz')
equal(compile('<if foo is at most eight>baz</if>')({ foo: 10 }, html => html), '')
equal(compile('<if foo is not at most eight>baz</if>')({ foo: 10 }, html => html), 'baz')

equal(compile('<if foo has length of bar>baz</if>')({ foo: [1, 2, 3, 4, 5], bar: 5 }, html => html), 'baz')
equal(compile('<if foo has length of bar>baz</if>')({ foo: [1, 2, 3, 4, 5], bar: 10 }, html => html), '')
equal(compile('<if foo does not have length of bar>baz</if>')({ foo: [1, 2, 3, 4, 5], bar: 10 }, html => html), 'baz')
equal(compile('<if foo has length of five>baz</if>')({ foo: [1, 2, 3, 4, 5], bar: 5 }, html => html), 'baz')
equal(compile('<if foo has length of six>baz</if>')({ foo: [1, 2, 3, 4, 5] }, html => html), '')

equal(compile('<if foo has length of at least bar>baz</if>')({ foo: [1, 2, 3, 4, 5], bar: 5 }, html => html), 'baz')
equal(compile('<if foo has length of at least bar>baz</if>')({ foo: [1, 2, 3, 4, 5], bar: 10 }, html => html), '')
equal(compile('<if foo does not have length of at least bar>baz</if>')({ foo: [1, 2, 3, 4, 5], bar: 10 }, html => html), 'baz')
equal(compile('<if foo has length of at least five>baz</if>')({ foo: 'lorem ipsum', bar: 5 }, html => html), 'baz')
equal(compile('<if foo has length of at least bar>baz</if>')({ foo: 'lorem ipsum', bar: 100 }, html => html), '')

equal(compile('<if foo has length of at most bar>baz</if>')({ foo: [1, 2, 3, 4, 5], bar: 5 }, html => html), 'baz')
equal(compile('<if foo has length of at most bar>baz</if>')({ foo: [1, 2, 3, 4, 5], bar: 1 }, html => html), '')
equal(compile('<if foo does not have length of at most bar>baz</if>')({ foo: [1, 2, 3, 4, 5], bar: 1 }, html => html), 'baz')
equal(compile('<if foo has length of at most five>baz</if>')({ foo: 'lorem ipsum', bar: 5 }, html => html), '')
equal(compile('<if foo does not have length of at most bar>baz</if>')({ foo: 'lorem ipsum', bar: 5 }, html => html), 'baz')

equal(compile('<if foo is different than bar>baz</if>')({ foo: 5, bar: 1 }, html => html), 'baz')
equal(compile('<if foo is different than bar>baz</if>')({ foo: 'lorem', bar: 'ipsum' }, html => html), 'baz')
equal(compile('<if foo is different than bar>baz</if>')({ foo: 5, bar: 5 }, html => html), '')
equal(compile('<if foo is different than bar>baz</if>')({ foo: 'lorem', bar: 'lorem' }, html => html), '')

equal(compile('<if foo is in bar>baz</if>')({ foo: 5, bar: [1,2,3,4]}, html => html), '')
equal(compile('<if foo is in bar>baz</if>')({ foo: 4, bar: [1,2,3,4]}, html => html), 'baz')
equal(compile('<if foo is in bar>baz</if>')({ foo: '5', bar: '1234'}, html => html), '')
equal(compile('<if foo is in bar>baz</if>')({ foo: '4', bar: '1234'}, html => html), 'baz')

equal(compile('<if foo is a url><a href="{foo}">{bar}</a></if>')({
 foo: 'https://buxlabs.pl/narzędzia/js',
 bar: 'click me'
}, html => html), '<a href="https://buxlabs.pl/narzędzia/js">click me</a>')

equal(compile('<if foo is a url><a href="{foo}">{bar}</a></if>')({}, html => html), '')

equal(compile('<content for title>foo</content><title content="title"></title>')({}, html => html), '<title>foo</title>')

equal(compile(`<img class="img-responsive" src="/assets/images/{photos[0]}" alt="Photo">`, {})({
  photos: ['foo.jpg', 'bar.jpg']
}, html => html), `<img class="img-responsive" src="/assets/images/foo.jpg" alt="Photo">`)

equal(compile(`<if foo>bar</if><else>baz<if qux>quux</if></else>`)({ foo: false, qux: false }), 'baz')
equal(compile(`<if foo>bar</if><else>baz<if qux>quux</if></else>`)({ foo: true, qux: true }), 'bar')
equal(compile(`<if foo>bar</if><else>baz<if qux>quux</if></else>`)({ foo: false, qux: true }), 'bazquux')
equal(compile(`<if foo>bar</if><else>baz<if qux>quux</if></else>`)({ foo: true, qux: false }), 'bar')

equal(compile(`<if foo>bar</if><elseif bar>baz<if qux>quux</if></elseif>`)({ foo: true, bar: true, qux: true }), 'bar')
equal(compile(`<if foo>bar</if><elseif bar>baz<if qux>quux</if></elseif>`)({ foo: false, bar: false, qux: false }), '')
equal(compile(`<if foo>bar</if><elseif bar>baz<if qux>quux</if></elseif>`)({ foo: true, bar: false, qux: false }), 'bar')
equal(compile(`<if foo>bar</if><elseif bar>baz<if qux>quux</if></elseif>`)({ foo: false, bar: true, qux: false }), 'baz')
equal(compile(`<if foo>bar</if><elseif bar>baz<if qux>quux</if></elseif>`)({ foo: false, bar: false, qux: true }), '')
equal(compile(`<if foo>bar</if><elseif bar>baz<if qux>quux</if></elseif>`)({ foo: false, bar: true, qux: true }), 'bazquux')
equal(compile(`<if foo>bar</if><elseif bar>baz<if qux>quux</if></elseif>`)({ foo: true, bar: true, qux: false }), 'bar')
equal(compile(`<if foo>bar</if><elseif bar>baz<if qux>quux</if></elseif>`)({ foo: true, bar: false, qux: true }), 'bar')

equal(compile(`<if foo>foo</if><elseif bar>bar</elseif><else><if baz>baz</if><else>ban</else></else>`)({ foo: true, bar: true, baz: true }), 'foo')
equal(compile(`<if foo>foo</if><elseif bar>bar</elseif><else><if baz>baz</if><else>ban</else></else>`)({ foo: false, bar: true, baz: true }), 'bar')
equal(compile(`<if foo>foo</if><elseif bar>bar</elseif><else><if baz>baz</if><else>ban</else></else>`)({ foo: false, bar: false, baz: true }), 'baz')
equal(compile(`<if foo>foo</if><elseif bar>bar</elseif><else><if baz>baz</if><else>ban</else></else>`)({ foo: false, bar: false, baz: false }), 'ban')
equal(compile(`<if foo>foo</if><elseif bar>bar</elseif><else><if baz>baz</if><else>ban</else></else>`)({ foo: false, bar: true, baz: true }), 'bar')
equal(compile(`<if foo>foo</if><elseif bar>bar</elseif><else><if baz>baz</if><else>ban</else></else>`)({ foo: false, bar: false, baz: true }), 'baz')
equal(compile(`<if foo>foo</if><elseif bar>bar</elseif><else><if baz>baz</if><else>ban</else></else>`)({ foo: true, bar: false, baz: true }), 'foo')

equal(compile(`<for doc in docs><for foo in doc.items>{foo.bar.baz.qux.quux}</for></for>`)({
 docs: [
  { items: [{ bar: { baz: { qux: { quux: '1' } } }}] },
  { items: [{ bar: { baz: { qux: { quux: '2' } } }}] },
  { items: [{ bar: { baz: { qux: { quux: '3' } } }}] }
 ]
}, html => html), '123')

equal(compile(`<for doc in docs>{doc.name}<for key and value in doc.items>{key}{value}</for></for>`)({
  docs: [
    { name: 'foo', items: { bar: 'baz', qux: 'quux' } }
  ]
}, html => html), 'foobarbazquxquux')


equal(compile(`<img src="./placeholder.png">`)({}, html => html), `<img src="./placeholder.png">`)

console.timeEnd('basic')
