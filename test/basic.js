const { equal } = require('assert')
const { compile } = require('..')

console.time('test: success')
equal(compile('')(), '')
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
equal(compile('{foo}{bar}')({ foo: 'foo', bar: 'bar' }, html => html), 'foobar')
equal(compile('<slot html="foo"/>')(), 'foo')
equal(compile('<slot text="foo"/>')({}, html => html.replace('foo', 'bar')), 'bar')
equal(compile('<slot html="foo"></slot>')(), 'foo')
equal(compile('<slot text="foo"></slot>')({}, html => html.replace('foo', 'bar')), 'bar')
equal(compile('<slot html="{foo}"/>')({ foo: 'bar' }), 'bar')
equal(compile('<slot html={foo} />')({ foo: 'bar' }), 'bar')
equal(compile('<slot html={foo.bar} />')({ foo: { bar: 'baz' } }), 'baz')
equal(compile('<slot text="{foo}"/>')({ foo: 'bar' }, html => html.replace('bar', 'foo')), 'foo')
equal(compile('<slot text="{foo.bar}"/>')({ foo: { bar: 'baz' } }, html => html.replace('baz', 'qux')), 'qux')
equal(compile('<slot html="{foo}"></slot>')({ foo: 'bar' }), 'bar')
equal(compile('<slot html="{foo} bar"></slot>')({ foo: 'baz' }), 'baz bar')
equal(compile('<slot html="foo {bar}"></slot>')({ bar: 'baz' }), 'foo baz')
equal(compile('<slot html="foo {bar} baz"></slot>')({ bar: 'qux' }), 'foo qux baz')
equal(compile('<slot html="foo    {bar}    baz"></slot>')({ bar: 'qux' }), 'foo qux baz')
equal(compile('<slot html="  foo {bar} baz  "></slot>')({ bar: 'qux' }), 'foo qux baz')
equal(compile('<slot text="{foo}"></slot>')({ foo: 'bar' }, html => html.replace('bar', 'foo')), 'foo')
equal(compile('<slot text={foo}></slot>')({ foo: 'bar' }, html => html.replace('bar', 'foo')), 'foo')
equal(compile('<slot text="{foo} baz"></slot>')({ foo: 'bar' }, html => html.replace('bar', 'foo')), 'foo baz')
equal(compile('<slot text="foo {bar}"></slot>')({ bar: 'baz' }, html => html.replace('bar', 'foo')), 'foo baz')
equal(compile('<slot html.bind="foo"></slot>')({ foo: 'bar' }), 'bar')
equal(compile('<slot text.bind="foo"></slot>')({ foo: 'bar' }, html => html.replace('bar', 'foo')), 'foo')
equal(compile('<div html="foo"></div>')(), '<div>foo</div>')
equal(compile('<div text="foo"></div>')({}, html => html.replace('foo', 'bar')), '<div>bar</div>')
equal(compile('<div>{foo}</div>')({ foo: 'bar' }, html => html.replace('bar', 'baz')), '<div>baz</div>')
equal(compile('<div>{foo()}</div>')({ foo: () => 'bar' }, html => html.replace('bar', 'baz')), '<div>baz</div>')
equal(compile('<div>{foo("bar")}</div>')({ foo: bar => bar }, html => html.replace('bar', 'baz')), '<div>baz</div>')
equal(compile('<div>{foo.bar()}</div>')({ foo: { bar: () => 'baz' } }, html => html.replace('baz', 'qux')), '<div>qux</div>')
equal(compile('<div>{foo.bar.baz()}</div>')({ foo: { bar: { baz: () => 'qux' } } }, html => html.replace('qux', 'quux')), '<div>quux</div>')
equal(compile('<div>{foo(bar)}</div>')({ foo: string => string, bar: 'bar' }, html => html.replace('bar', 'baz')), '<div>baz</div>')
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

equal(compile('<ul><each todo in todos><li html="{todo.description}"></li></each></ul>')({
  todos: [
    { description: 'foo' },
    { description: 'bar' },
    { description: 'baz' },
    { description: 'qux' }
  ]
}), '<ul><li>foo</li><li>bar</li><li>baz</li><li>qux</li></ul>')

equal(compile('<ul><each foo in bar><li html="{foo.baz}"></li></each></ul>')({
  bar: [
    { baz: 'foo' },
    { baz: 'bar' },
    { baz: 'baz' },
    { baz: 'qux' }
  ]
}), '<ul><li>foo</li><li>bar</li><li>baz</li><li>qux</li></ul>')

equal(compile('<ul><each foo in bar><each baz in foo><li html="{baz.qux}"></li></each></each></ul>')({
  bar: [
    [ { qux: 1 }, { qux: 2 } ],
    [ { qux: 3 }, { qux: 4 } ],
    [ { qux: 5 }, { qux: 6 } ]
  ]
}), '<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li></ul>')

equal(compile('<ul><each foo in bar><each baz in foo.qux><li html="{baz}"></li></each></each></ul>')({
  bar: [
    { qux: [1, 2] },
    { qux: [3, 4] },
    { qux: [5, 6] }
  ]
}), '<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li></ul>')

equal(compile('<ul><each todo in todos><li html="{todo.text}"></li></each></ul>')({
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

equal(compile('<ul><each a in b><li html="{a.b}"></li></each></ul>')({
  b: [
    { b: 'foo' },
    { b: 'bar' }
  ]
}), '<ul><li>foo</li><li>bar</li></ul>')

equal(compile('<ul><each t in b><li html="{t.b}"></li></each></ul>')({
  b: [
    { b: 'foo' },
    { b: 'bar' }
  ]
}), '<ul><li>foo</li><li>bar</li></ul>')

equal(compile('<ul><each o in b><li html="{o.b}"></li></each></ul>')({
  b: [
    { b: 'foo' },
    { b: 'bar' }
  ]
}), '<ul><li>foo</li><li>bar</li></ul>')

equal(compile('<ul><each e in b><li html="{e.b}"></li></each></ul>')({
  b: [
    { b: 'foo' },
    { b: 'bar' }
  ]
}), '<ul><li>foo</li><li>bar</li></ul>')

equal(compile('<each foo in foos><img src="{foo.src}"></each>')({
  foos: [
    { title: 'foo', src: 'foo.jpg' },
    { title: 'bar', src: 'bar.jpg' }
  ]
}, html => html), '<img src="foo.jpg"><img src="bar.jpg">')

equal(compile('<each foo in foos><if foo.src><img src="{foo.src}"></if></each>')({
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

equal(compile('<each foo in foos><if foo.src><img src="{foo.src}"></if><elseif foo.href><a href="{foo.href}"></a></elseif></each>')({
  foos: [
    { title: 'foo', src: 'foo.jpg', href: null },
    { title: 'bar', src: null, href: null },
    { title: 'baz', src: null, href: 'https://buxlabs.pl' }
  ]
}, html => html), '<img src="foo.jpg"><a href="https://buxlabs.pl"></a>')

equal(compile('{foo}<each foo in bar><div>{foo.baz}</div></each>')({
  foo: 'bar',
  bar: [
    { baz: 'qux' },
    { baz: 'quux' },
    { baz: 'quuux' }
  ]
}, html => html), 'bar<div>qux</div><div>quux</div><div>quuux</div>')

equal(compile('<div>{foo}<each foo in bar><div>{foo.baz}</div></each></div>')({
  foo: 'bar',
  bar: [
    { baz: 'qux' },
    { baz: 'quux' },
    { baz: 'quuux' }
  ]
}, html => html), '<div>bar<div>qux</div><div>quux</div><div>quuux</div></div>')

equal(compile('<div>{foo}</div><each foo in bar><div>{foo.baz}</div></each>')({
  foo: 'bar',
  bar: [
    { baz: 'qux' },
    { baz: 'quux' },
    { baz: 'quuux' }
  ]
}, html => html), '<div>bar</div><div>qux</div><div>quux</div><div>quuux</div>')

equal(compile('<each foo in bar><div>{foo.baz}</div></each><div>{foo}</div>')({
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

equal(compile('<if foo and bar>baz</if>')({
  foo: true,
  bar: true
}, html => html), 'baz')

equal(compile('<if foo and bar>baz</if>')({
  foo: false,
  bar: true
}, html => html), '')

equal(compile('<if foo and bar>baz</if>')({
  foo: true,
  bar: false
}, html => html), '')

equal(compile('<if foo and bar and baz>qux</if>')({
  foo: true,
  bar: true,
  baz: true
}, html => html), 'qux')

equal(compile('<if foo and bar and baz>qux</if>')({
  foo: false,
  bar: true,
  baz: true
}, html => html), '')

equal(compile('<if foo and bar and baz>qux</if>')({
  foo: true,
  bar: true,
  baz: false
}, html => html), '')

equal(compile('<if foo and bar and baz>qux</if>')({
  foo: false,
  bar: true,
  baz: false
}, html => html), '')

equal(compile('<if foo and bar and baz and ban>qux</if>')({
  foo: true,
  bar: true,
  baz: true,
  ban: true
}, html => html), 'qux')

equal(compile('<if foo and bar and baz and ban>qux</if>')({
  foo: false,
  bar: true,
  baz: true,
  ban: true
}, html => html), '')

equal(compile('<if foo and bar and baz and ban>qux</if>')({
  foo: false,
  bar: false,
  baz: false,
  ban: false
}, html => html), '')

equal(compile('<if foo and bar and baz and ban>qux</if>')({
  foo: true,
  bar: true,
  baz: true,
  ban: false
}, html => html), '')

equal(compile('<if foo or bar>baz</if>')({
  foo: true,
  bar: true
}, html => html), 'baz')

equal(compile('<if foo or bar>baz</if>')({
  foo: true,
  bar: false
}, html => html), 'baz')

equal(compile('<if foo or bar>baz</if>')({
  foo: false,
  bar: true
}, html => html), 'baz')

equal(compile('<if foo or bar>baz</if>')({
  foo: false,
  bar: false
}, html => html), '')

equal(compile('<if foo eq bar>baz</if>')({
  foo: 42,
  bar: 42
}, html => html), 'baz')

equal(compile('<if foo eq bar>baz</if>')({
  foo: 40,
  bar: 42
}, html => html), '')

equal(compile('<if foo eq bar>baz</if>')({
  foo: '42',
  bar: 42
}, html => html), '')

equal(compile('<if foo gt bar>baz</if>')({
  foo: 42,
  bar: 30
}, html => html), 'baz')

equal(compile('<if foo gt bar>baz</if>')({
  foo: 42,
  bar: 42
}, html => html), '')

equal(compile('<if foo gt bar>baz</if>')({
  foo: 42,
  bar: 50
}, html => html), '')

equal(compile('<if foo lt bar>baz</if>')({
  foo: 42,
  bar: 30
}, html => html), '')

equal(compile('<if foo lt bar>baz</if>')({
  foo: 42,
  bar: 42
}, html => html), '')

equal(compile('<if foo lt bar>baz</if>')({
  foo: 42,
  bar: 50
}, html => html), 'baz')

equal(compile('<if foo gte bar>baz</if>')({
  foo: 42,
  bar: 30
}, html => html), 'baz')

equal(compile('<if foo gte bar>baz</if>')({
  foo: 42,
  bar: 42
}, html => html), 'baz')

equal(compile('<if foo gte bar>baz</if>')({
  foo: 42,
  bar: 50
}, html => html), '')

equal(compile('<if foo lte bar>baz</if>')({
  foo: 42,
  bar: 30
}, html => html), '')

equal(compile('<if foo lte bar>baz</if>')({
  foo: 42,
  bar: 42
}, html => html), 'baz')

equal(compile('<if foo lte bar>baz</if>')({
  foo: 42,
  bar: 50
}, html => html), 'baz')

equal(compile('<if foo equals bar>baz</if>')({
  foo: 42,
  bar: 42
}, html => html), 'baz')

equal(compile('<if foo equals bar>baz</if>')({
  foo: 40,
  bar: 42
}, html => html), '')

equal(compile('<if foo equals bar>baz</if>')({
  foo: '42',
  bar: 42
}, html => html), '')

equal(compile('<if foo is present>baz</if>')({
  foo: {}
}, html => html), 'baz')

equal(compile('<if foo is present>baz</if>')({}, html => html), '')

equal(compile('<if foo is positive>baz</if>')({
  foo: 1
}, html => html), 'baz')

equal(compile('<if foo is positive>baz</if>')({
  foo: 0
}, html => html), '')

equal(compile('<if foo is positive>baz</if>')({
  foo: -1
}, html => html), '')

equal(compile('<if foo is negative>baz</if>')({
  foo: 1
}, html => html), '')

equal(compile('<if foo is negative>baz</if>')({
  foo: 0
}, html => html), '')

equal(compile('<if foo is negative>baz</if>')({
  foo: -1
}, html => html), 'baz')

equal(compile('<if foo is finite>baz</if>')({
  foo: 100
}, html => html), 'baz')

equal(compile('<if foo is finite>baz</if>')({
  foo: Infinity
}, html => html), '')

equal(compile('<if foo is finite>baz</if>')({
  foo: -Infinity
}, html => html), '')

equal(compile('<if foo is finite>baz</if>')({
  foo: 0
}, html => html), 'baz')

equal(compile('<if foo is finite>baz</if>')({
  foo: NaN
}, html => html), '')

equal(compile('<if foo is finite>baz</if>')({
  foo: 2e64
}, html => html), 'baz')

equal(compile('<if foo is infinite>baz</if>')({
  foo: 100
}, html => html), '')

equal(compile('<if foo is infinite>baz</if>')({
  foo: Infinity
}, html => html), 'baz')

equal(compile('<if foo is infinite>baz</if>')({
  foo: -Infinity
}, html => html), 'baz')

equal(compile('<if foo is infinite>baz</if>')({
  foo: 0
}, html => html), '')

equal(compile('<if foo is infinite>baz</if>')({
  foo: NaN
}, html => html), '')

equal(compile('<if foo is infinite>baz</if>')({
  foo: 2e1000
}, html => html), 'baz')

equal(compile('<if foo is empty>baz</if>')({
  foo: []
}, html => html), 'baz')

equal(compile('<if foo is empty>baz</if>')({
  foo: new Array()
}, html => html), 'baz')

equal(compile('<if foo is empty>baz</if>')({
  foo: [{ baz: 'bar' }, {}]
}, html => html), '')

equal(compile('<if foo is empty>baz</if>')({
  foo: ''
}, html => html), 'baz')

equal(compile('<if foo is empty>baz</if>')({
  foo: 'qux'
}, html => html), '')

equal(compile('<if foo is empty>baz</if>')({
  foo: null
}, html => html), 'baz')

equal(compile('<if foo is empty>baz</if>')({
  foo: undefined
}, html => html), 'baz')

equal(compile('<if foo is empty>baz</if>')({
  foo: {}
}, html => html), 'baz')

equal(compile('<if foo is empty>baz</if>')({
  foo: { bar: null }
}, html => html), '')

equal(compile('<if foo is empty>baz</if>')({
  foo: {
    1: 'bar',
    2: 'baz'
  }
}, html => html), '')

equal(compile('<if foo is empty>baz</if>')({
  foo: { bar: 'ban' }
}, html => html), '')

equal(compile('<if foo is empty>baz</if>')({
  foo: function () {}
}, html => html), 'baz')

equal(compile('<if foo is empty>baz</if>')({
  foo: new Map()
}, html => html), 'baz')

equal(compile('<if foo is empty>baz</if>')({
  foo: new Map([['foo', 'bar'], ['baz', 'ban']])
}, html => html), '')

equal(compile('<if foo is empty>baz</if>')({
  foo: new Set()
}, html => html), 'baz')

equal(compile('<if foo is empty>baz</if>')({
  foo: new Set([1, 'foo', 'bar'])
}, html => html), '')

equal(compile('<if foo is an array>baz</if>')({
  foo: []
}, html => html), 'baz')

equal(compile('<if foo is an array>baz</if>')({
  foo: []
}, html => html), 'baz')

equal(compile('<if foo is an array>baz</if>')({
  foo: ''
}, html => html), '')

equal(compile('<if foo is an array>baz</if>')({
  foo: {}
}, html => html), '')

equal(compile('<if foo is a string>baz</if>')({
  foo: ''
}, html => html), 'baz')

equal(compile('<if foo is a string>baz</if>')({
  foo: 'foo'
}, html => html), 'baz')

equal(compile('<if foo is a string>baz</if>')({
  foo: {}
}, html => html), '')

equal(compile('<if foo is a number>baz</if>')({
  foo: []
}, html => html), '')

equal(compile('<if foo is a number>baz</if>')({
  foo: 13
}, html => html), 'baz')

equal(compile('<if foo is a number>baz</if>')({
  foo: 4
}, html => html), 'baz')

equal(compile('<if foo is a number>baz</if>')({
  foo: {}
}, html => html), '')

equal(compile('<if foo is a symbol>baz</if>')({
  foo: Symbol('foo')
}, html => html), 'baz')

equal(compile('<if foo is a symbol>baz</if>')({
  foo: {}
}, html => html), '')

equal(compile('<if foo is a map>baz</if>')({
  foo: new Map()
}, html => html), 'baz')

equal(compile('<if foo is a map>baz</if>')({
  foo: {}
}, html => html), '')

equal(compile('<if foo is a map>baz</if>')({
  foo: []
}, html => html), '')

equal(compile('<if foo is a set>baz</if>')({
  foo: new Set()
}, html => html), 'baz')

equal(compile('<if foo is a set>baz</if>')({
  foo: {}
}, html => html), '')

equal(compile('<if foo is a set>baz</if>')({
  foo: []
}, html => html), '')

equal(compile('<if foo is a boolean>baz</if>')({
  foo: true
}, html => html), 'baz')

equal(compile('<if foo is a boolean>baz</if>')({
  foo: false
}, html => html), 'baz')

equal(compile('<if foo is a boolean>baz</if>')({
  foo: false
}, html => html), 'baz')

equal(compile('<if foo is a boolean>baz</if>')({
  foo: true
}, html => html), 'baz')

equal(compile('<if foo is a boolean>baz</if>')({
  foo: false
}, html => html), 'baz')

equal(compile('<if foo is undefined>baz</if>')({
  foo: undefined
}, html => html), 'baz')

equal(compile('<if foo is undefined>baz</if>')({
  foo: {}
}, html => html), '')

equal(compile('<if foo is null>baz</if>')({
  foo: null
}, html => html), 'baz')

equal(compile('<if foo is an object>baz</if>')({
  foo: {}
}, html => html), 'baz')

equal(compile('<if foo is an object>baz</if>')({
  foo: null
}, html => html), '')

equal(compile('<if foo is an object>baz</if>')({
  foo: function () {}
}, html => html), 'baz')

equal(compile('<if foo is a regexp>baz</if>')({
  foo: /regexp/
}, html => html), 'baz')

equal(compile('<if foo is a regexp>baz</if>')({
  foo: new RegExp('regexp')
}, html => html), 'baz')

equal(compile('<if foo is a regexp>baz</if>')({
  foo: ''
}, html => html), '')

equal(compile('<if foo is a date>baz</if>')({
  foo: new Date()
}, html => html), 'baz')

equal(compile('<if foo is a date>baz</if>')({
  foo: new Date(2018, 15, 04)
}, html => html), 'baz')

equal(compile('<if foo is a date>baz</if>')({
  foo: '08.09.2018'
}, html => html), '')

equal(compile('<if foo is even>baz</if>')({
  foo: 2
}, html => html), 'baz')

equal(compile('<if foo is even>baz</if>')({
  foo: 0
}, html => html), 'baz')

equal(compile('<if foo is even>baz</if>')({
  foo: 1
}, html => html), '')

equal(compile('<if foo is even>baz</if>')({
  foo: 'baz'
}, html => html), '')

equal(compile('<if foo is even>baz</if>')({
  foo: [1, 2]
}, html => html), '')

equal(compile('<if foo is even>baz</if>')({
  foo: [1, 2].length
}, html => html), 'baz')

equal(compile('<if foo is odd>baz</if>')({
  foo: 1
}, html => html), 'baz')

equal(compile('<if foo is odd>baz</if>')({
  foo: 2
}, html => html), '')

equal(compile('<if foo is odd>baz</if>')({
  foo: [1].length
}, html => html), 'baz')

equal(compile('<if foo is odd>baz</if>')({
  foo: ''
}, html => html), '')

equal(compile('<if foo is odd>baz</if>')({
  foo: 'bar'.length
}, html => html), 'baz')

equal(compile('<if foo bitwise or bar>baz</if>')({
  foo: 0,
  bar: 0
}, html => html), '')

equal(compile('<if foo bitwise or bar>baz</if>')({
  foo: 1,
  bar: 1
}, html => html), 'baz')

equal(compile('<if foo bitwise or bar>baz</if>')({
  foo: 1,
  bar: 0
}, html => html), 'baz')

equal(compile('<if foo bitwise or bar>baz</if>')({
  foo: 0,
  bar: 1
}, html => html), 'baz')

equal(compile('<if foo bitwise and bar>baz</if>')({
  foo: 0,
  bar: 0
}, html => html), '')

equal(compile('<if foo bitwise and bar>baz</if>')({
  foo: 1,
  bar: 1
}, html => html), 'baz')

equal(compile('<if foo bitwise and bar>baz</if>')({
  foo: 1,
  bar: 0
}, html => html), '')

equal(compile('<if foo bitwise and bar>baz</if>')({
  foo: 0,
  bar: 1
}, html => html), '')

equal(compile('<if foo bitwise xor bar>baz</if>')({
  foo: 0,
  bar: 0
}, html => html), '')

equal(compile('<if foo bitwise xor bar>baz</if>')({
  foo: 0,
  bar: 1
}, html => html), 'baz')

equal(compile('<if foo bitwise xor bar>baz</if>')({
  foo: 1,
  bar: 0
}, html => html), 'baz')

equal(compile('<if foo bitwise xor bar>baz</if>')({
  foo: 1,
  bar: 1
}, html => html), '')

equal(compile('<ul><each todo in="{todos}"><li html="{todo.description}"></li></each></ul>')({
  todos: [
    { description: 'foo' },
    { description: 'bar' },
    { description: 'baz' },
    { description: 'qux' }
  ]
}), '<ul><li>foo</li><li>bar</li><li>baz</li><li>qux</li></ul>')

equal(compile('<ul><each foo in="{bar}"><each baz in="{foo.qux}"><li html="{baz}"></li></each></each></ul>')({
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

equal(compile('<if foo is present>bar</if>')({
  foo: true
}, html => html), 'bar')

equal(compile('<if foo is present>bar</if>')({
  foo: false
}, html => html), 'bar')

equal(compile('<if foo is present>bar</if>')({
  foo: null
}, html => html), 'bar')

equal(compile('<if foo is present>bar</if>')({
  foo: undefined
}, html => html), '')

equal(compile('<if foo is not present>bar</if>')({
  foo: undefined
}, html => html), 'bar')

equal(compile('<if foo is less than bar>baz</if>')({
  foo: 100,
  bar: 50
}, html => html), '')

equal(compile('<if foo is less than bar>baz</if>')({
  foo: 50,
  bar: 50
}, html => html), '')

equal(compile('<if foo is less than bar>baz</if>')({
  foo: 30,
  bar: 40
}, html => html), 'baz')

equal(compile('<if foo is greater than bar>baz</if>')({
  foo: 100,
  bar: 50
}, html => html), 'baz')

equal(compile('<if foo is greater than bar>baz</if>')({
  foo: 50,
  bar: 50
}, html => html), '')

equal(compile('<if foo is greater than bar>baz</if>')({
  foo: 30,
  bar: 40
}, html => html), '')

equal(compile('{"Hello World" | uppercase}')({}, html => html), 'HELLO WORLD')

equal(compile('{foo | uppercase}')({
  foo: 'bar'
}, html => html), 'BAR')

equal(compile('<div html="{foo | uppercase}"></div>')({ foo: 'bar' }), '<div>BAR</div>')
equal(compile('<div html="{foo(bar())}"></div>')({ foo: string => string, bar: () => 'bar' }, html => html), '<div>bar</div>')
equal(compile('<div text="{foo(bar())}"></div>')({ foo: string => string, bar: () => 'bar' }, html => html), '<div>bar</div>')
equal(compile('<div text="{foo | uppercase}"></div>')({ foo: 'bar' }, html => html), '<div>BAR</div>')
equal(compile('<div class="{foo | uppercase}"></div>')({ foo: 'bar' }, html => html), '<div class="BAR"></div>')
equal(compile('<input checked="{query | trim}">')({ query: '' }, html => html), '<input>')
equal(compile('<input checked="{query | trim}">')({ query: '   ' }, html => html), '<input>')
equal(compile('<input checked="{query | trim}">')({ query: 'bar' }, html => html), '<input checked>')
equal(compile('<div>{foo | whitespaceless}</div>')({ foo: 'b  ar' }, html => html), '<div>bar</div>')
equal(compile('{foo | uppercase}')({ foo: 'bar' }, html => html), 'BAR')
equal(compile('{foo | upcase}')({ foo: 'bar' }, html => html), 'BAR')
equal(compile('{foo | lowercase}')({ foo: 'BAR' }, html => html), 'bar')
equal(compile('{foo | downcase}')({ foo: 'BAR' }, html => html), 'bar')
equal(compile('{foo | dasherize}')({ foo: 'foo_bar' }, html => html), 'foo-bar')
equal(compile('{foo | constantize}')({ foo: 'bar' }, html => html), 'BAR')
equal(compile('{foo | underscore}')({ foo: 'foo-bar'}, html => html), 'foo_bar')
equal(compile('{foo | reverse}')({ foo: 'bar' }, html => html), 'rab')
equal(compile('{foo | capitalize}')({ foo: 'bar' }, html => html), 'Bar')
equal(compile('{foo | unescape}')({ foo: '&amp;' }, html => html), '&')
equal(compile('{foo | lowerfirst}')({ foo: 'FOO' }, html => html), 'fOO')
equal(compile('{foo | humanize}')({ foo: 'foo_bar' }, html => html), 'Foo bar')
equal(compile('{foo | titleize}')({ foo: 'foo bar' }, html => html), 'Foo Bar')
equal(compile('{foo | titlecase}')({ foo: 'foo bar' }, html => html), 'Foo Bar')
equal(compile('{foo | classify}')({ foo: 'foobar' }, html => html), 'Foobar')
equal(compile('{foo | pluralize}')({ foo: 'word' }, html => html), 'words')
equal(compile('{foo | singularize}')({ foo: 'words' }, html => html), 'word')
equal(compile('{foo | swapcase}')({ foo: 'BaR' }, html => html), 'bAr')
equal(compile('{foo | camelize}')({ foo: 'bar_baz' }, html => html), 'barBaz')

equal(compile('{Math.abs(foo)}')({ foo: -1 }, html => html), '1')
equal(compile('{Math.ceil(foo)}')({ foo: 1.6 }, html => html), '2')
equal(compile('{Math.floor(foo)}')({ foo: 1.6 }, html => html), '1')
equal(compile('{Math.round(foo)}')({ foo: 1.4 }, html => html), '1')
equal(compile('{Math.round(foo)}')({ foo: 1.6 }, html => html), '2')

equal(compile('{foo | abs}')({ foo: -1 }, html => html), '1')
equal(compile('{foo | ceil}')({ foo: 1.6 }, html => html), '2')
equal(compile('{foo | floor}')({ foo: 1.6 }, html => html), '1')
equal(compile('{foo | round}')({ foo: 1.4 }, html => html), '1')
equal(compile('{foo | round}')({ foo: 1.6 }, html => html), '2')

equal(compile('{foo | pow(3)}')({ foo: 2 }, html => html), '8')
equal(compile('{foo | truncate(6)}')({ foo: 'foobarbaz' }, html => html), 'foo...')
equal(compile('{foo | pad("0")}')({ foo: 'foo\nbar' }, html => html), '0foo\n0bar')
equal(compile('{foo | max}')({ foo: [1, 2, 3] }, html => html), '3')
equal(compile('{foo | min}')({ foo: [1, 2, 3] }, html => html), '1')
equal(compile('{foo | sqrt}')({ foo: 4 }, html => html), '2')

equal(compile('{Math.pow(foo, 3)}')({ foo: 2 }, html => html), '8')

equal(compile('{Number.isFinite(foo)}')({ foo: 42 }, html => html), 'true')
equal(compile('{Number.isFinite(foo)}')({ foo: Infinity }, html => html), 'false')

equal(compile('{JSON.stringify(foo, null, 2)}')({ foo: { bar: 'baz' } }, html => html), '{\n  "bar": "baz"\n}')
equal(compile('{JSON.stringify(foo, null, 4)}')({ foo: { bar: 'baz' } }, html => html), '{\n    "bar": "baz"\n}')
equal(compile('{foo | json}')({ foo: { bar: 'baz' } }, html => html), '{\n  "bar": "baz"\n}')
equal(compile('{foo | json(4)}')({ foo: { bar: 'baz' } }, html => html), '{\n    "bar": "baz"\n}')
equal(compile('{foo | inspect}')({ foo: { bar: 'baz' } }, html => html), '{\n  "bar": "baz"\n}')
equal(compile('{foo | inspect(4)}')({ foo: { bar: 'baz' } }, html => html), '{\n    "bar": "baz"\n}')
equal(compile('{foo | prettify}')({ foo: { bar: 'baz' } }, html => html), '{\n  "bar": "baz"\n}')
equal(compile('{foo | prettify(4)}')({ foo: { bar: 'baz' } }, html => html), '{\n    "bar": "baz"\n}')
equal(compile('{foo | prettify}')({ foo: '{"bar": "baz"}' }, html => html), '{\n  "bar": "baz"\n}')
equal(compile('{foo | prettify(4)}')({ foo: '{"bar": "baz"}' }, html => html), '{\n    "bar": "baz"\n}')

equal(compile('{foo | first}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, html => html), '1')
equal(compile('{foo | second}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, html => html), '2')
equal(compile('{foo | third}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, html => html), '3')
equal(compile('{foo | fourth}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, html => html), '4')
equal(compile('{foo | fifth}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, html => html), '5')
equal(compile('{foo | sixth}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, html => html), '6')
equal(compile('{foo | seventh}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, html => html), '7')
equal(compile('{foo | eigth}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, html => html), '8')
equal(compile('{foo | ninth}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, html => html), '9')
equal(compile('{foo | tenth}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, html => html), '10')
equal(compile('{foo | last}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, html => html), '10')

equal(compile('<for number in range="1...10">{number}</for>')({}, html => html), '123456789')
equal(compile('<for number in range="1..10">{number}</for>')({}, html => html), '12345678910')

equal(compile('{foo + 1}')({ foo: 0 }, html => html), '1')
equal(compile('{1 + foo}')({ foo: 0 }, html => html), '1')
equal(compile('{foo + bar}')({ foo: 0, bar: 1 }, html => html), '1')
equal(compile('{foo + bar}')({
  foo: '<script>alert("foo")</script>',
  bar: 'hello'
}, html => html.replace(/</g, '&lt;').replace(/>/g, '&gt;')), '&lt;script&gt;alert("foo")&lt;/script&gt;hello')
equal(compile('{foo + bar + baz}')({ foo: 0, bar: 1, baz: 2 }, html => html), '3')
equal(compile('{foo() + 1}')({ foo: () => 0 }, html => html), '1')
equal(compile('{foo() + bar() + 2}')({ foo: () => 0, bar: () => 1}, html => html), '3')
equal(compile('{foo() + bar() + baz()}')({ foo: () => 0, bar: () => 1, baz: () => 2}, html => html), '3')
equal(compile('{foo() + bar + 2}')({ foo: () => 0, bar: 1 }, html => html), '3')
equal(compile('{foo(bar) + baz}')({ foo: (bar) => bar, bar: 2, baz: 1 }, html => html), '3')
// equal(compile('{"<script></script>"}')(
//   {}, html => html.replace(/</g, '&lt;').replace(/>/g, '&gt;')), '&lt;script&gt;&lt;/script&gt')
// equal(compile('{foo.bar + 1}')({ foo: { bar: 1 }  }, html => html), '2')
equal(compile('<h5>#{index + 1} {translate("blog.author")}: {author}</h5>')(
  { index: 0, translate: () => 'author', author: 'Olek' }, html => html), '<h5>#1 author: Olek</h5>')
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
equal(compile('<button>{translate("buttons.search")}&nbsp;<span class="fa fa-search"></span></button>')({ translate () { return 'foo' } }, html => html), '<button>foo&nbsp;<span class="fa fa-search"></span></button>')
equal(compile(`<for month in='{["Styczeń", "Luty", "Marzec"]}'>{month}</for>`)({}, html => html), 'StyczeńLutyMarzec')
equal(compile(`<for foo in='{[bar, baz]}'>{foo}</for>`)({ bar: 'bar', baz: 'baz' }, html => html), 'barbaz')
// equal(compile(`<for foo in='{[{ key: 'bar' }, { key: 'baz' }]}'>{foo.key}</for>`)({}, html => html), 'barbaz')

// equal(compile(`<import Button from="./fixtures/import/Button.html"><Button>foo</Button>`)(
//   {}, html => html), '<div class="btn btn-primary">foo</div>')
// equal(compile(`<DIV></DIV>`)({}, html => html), '<div></div>')
equal(compile(`<partial from="./fixtures/partial/terms.html"></partial>`)({}, html => html), '<div>foo bar baz</div>')
equal(compile(`<partial from="./fixtures/partial/footer.html"></partial>`)({}, html => html), '<div>foo</div><footer>bar</footer>')
equal(compile(`<partial from="./fixtures/partial/header.html"></partial>`)({ title: 'foo' }, html => html), '<div>foo</div>')
equal(compile(`<partial from="./fixtures/partial/header.html">`)({ title: 'foo' }, html => html), '<div>foo</div>')
equal(compile(`<partial from="./fixtures/partial/header.html" />`)({ title: 'foo' }, html => html), '<div>foo</div>')

equal(compile(`<script inline>const foo = "bar"</script>{foo}`)({}, html => html), 'bar')

console.timeEnd('test: success')
