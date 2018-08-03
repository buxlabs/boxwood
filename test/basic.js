const { equal } = require('assert')
const { compile } = require('..')

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
equal(compile('<input type="number" value="100" autocomplete="off">')(), '<input type="number" value="100" autocomplete="off">')
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

equal(compile('<div tag="{tag}"></div>')({ tag: 'button' }), '<button></button>')
equal(compile('<div tag="{tag}"></div>')({ tag: 'a' }), '<a></a>')
equal(compile('<div tag.bind="tag"></div>')({ tag: 'button' }), '<button></button>')
equal(compile('<div tag.bind="tag"></div>')({ tag: 'a' }), '<a></a>')

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

equal(compile('<div html="{foo(bar())}"></div>')({ foo: string => string, bar: () => 'bar' }, html => html), '<div>bar</div>')
equal(compile('<div text="{foo(bar())}"></div>')({ foo: string => string, bar: () => 'bar' }, html => html), '<div>bar</div>')

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

equal(compile('<button>{translate("buttons.search")}&nbsp;<span class="fa fa-search"></span></button>')({ translate () { return 'foo' } }, html => html), '<button>foo&nbsp;<span class="fa fa-search"></span></button>')

equal(compile(`{foo.bar}<rescue>baz</rescue>`)({}, html => html), 'baz')
equal(compile(`{foo.bar}<rescue>baz</rescue>`)({ foo: { bar: 'qux' } }, html => html), 'qux')

equal(compile('<style></style>')({}, html => html), '<style></style>')
equal(compile('<script></script>')({}, html => html), '<script></script>')
equal(compile('<template></template>')({}, html => html), '<template></template>')

equal(compile('<style>.foo{color:red}</style>')({}, html => html), '<style>.foo{color:red}</style>')
equal(compile('<script>console.log({ foo: "bar" })</script>')({}, html => html), '<script>console.log({ foo: "bar" })</script>')
equal(compile('<template><div></div></template>')({}, html => html), '<template><div></div></template>')
equal(compile('<template><div>{}</div></template>')({}, html => html), '<template><div>{}</div></template>')
equal(compile('<script type="text/javascript" src="./main.js"></script>')({}, html => html), '<script type="text/javascript" src="./main.js"></script>')
equal(compile('<style type="text/css">.foo{color:red}</style>')({}, html => html), '<style type="text/css">.foo{color:red}</style>')

equal(compile('<content for title>foo</content><title content="title"></title>')({}, html => html), '<title>foo</title>')

equal(compile(`<img class="img-responsive" src="/assets/images/{photos[0]}" alt="Photo">`, {})({
  photos: ['foo.jpg', 'bar.jpg']
}, html => html), `<img class="img-responsive" src="/assets/images/foo.jpg" alt="Photo">`)

equal(compile(`<img src="./placeholder.png">`)({}, html => html), `<img src="./placeholder.png">`)

console.timeEnd('basic')
