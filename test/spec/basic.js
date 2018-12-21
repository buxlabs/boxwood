import test from '../helpers/test'
import compile from '../helpers/compile'
import escape from 'escape-html'

test('basic: it returns nothing for no template', async assert => {
  const template = await compile('')
  assert.deepEqual(template(), '')
})

test('basic: it ignores comments', async assert => {
  const template = await compile('<!-- foo -->')
  assert.deepEqual(template(), '')
})

test('basic: it handles doctype', async assert => {
  const template = await compile('<!DOCTYPE html>')
  assert.deepEqual(template(), '<!doctype html>')
})

test('basic: it handles content', async assert => {
  const template = await compile('hello world')
  assert.deepEqual(template(), 'hello world')
})

test('basic: it handles empty div tags', async assert => {
  const template = await compile('<div></div>')
  assert.deepEqual(template(), '<div></div>')
})

test('basic: it handles div tags with content', async assert => {
  const template = await compile('<div>foo</div>')
  assert.deepEqual(template(), '<div>foo</div>')
})

test('basic: it handles content before an empty tag', async assert => {
  const template = await compile('foo<div></div>')
  assert.deepEqual(template(), 'foo<div></div>')
})

test('basic: it handles content after an empty tag', async assert => {
  const template = await compile('<div></div>foo')
  assert.deepEqual(template(), '<div></div>foo')
})

test('basic: it handles multiple tags', async assert => {
  const template = await compile('<div></div><span></span>')
  assert.deepEqual(template(), '<div></div><span></span>')
})

test('basic: it handles a tag with an attribute', async assert => {
  const template = await compile('<div class="foo"></div>')
  assert.deepEqual(template(), '<div class="foo"></div>')
})

test('basic: it handles a tag with multiple attributes', async assert => {
  const template = await compile('<a href="/foo" id="foo"></a>')
  assert.deepEqual(template(), '<a href="/foo" id="foo"></a>')
})

test('basic: it handles a nested tag with multiple attributes', async assert => {
  const template = await compile('<head><meta name="viewport" content="width=device-width, initial-scale=1"></head>')
  assert.deepEqual(template(), '<head><meta name="viewport" content="width=device-width, initial-scale=1"></head>')
})

test('basic: it handles self closing input tag', async assert => {
  const template = await compile('<input>')
  assert.deepEqual(template(), '<input>')
})

test('basic: it strips the additional slash character for self closing input tag', async assert => {
  const template = await compile('<input/>')
  assert.deepEqual(template(), '<input>')
})

test('basic: it handles multiple attributes for an input', async assert => {
  const template = await compile('<input type="number" value="100" autocomplete="off">')
  assert.deepEqual(template(), '<input type="number" value="100" autocomplete="off">')
})

test('basic: it strips unwanted whitespace in tag definition', async assert => {
  const template = await compile('<input    value="100">')
  assert.deepEqual(template(), '<input value="100">')
})

test('basic: it works for empty value attribute', async assert => {
  const template = await compile('<input value="">')
  assert.deepEqual(template(), '<input value="">')
})

test('basic: it works for empty class attribute', async assert => {
  const template = await compile('<input class="">')
  assert.deepEqual(template(), '<input class="">')
})

test('basic: it handles variables', async assert => {
  const template = await compile('{foo}')
  assert.deepEqual(template({ foo: 'foo' }, escape), 'foo')
})

test('basic: it handles variables and content', async assert => {
  const template = await compile('{foo}, world!')
  assert.deepEqual(template({ foo: 'Hello' }, escape), 'Hello, world!')
})

test('basic: it handles objects with properties', async assert => {
  const template = await compile('{foo.bar}')
  assert.deepEqual(template({ foo: { bar: 'bar' } }, escape), 'bar')
})

test('basic: it handles the bracket notation', async assert => {
  const template = await compile('{foo[bar]}')
  assert.deepEqual(template({ foo: { bar: 'bar' }, bar: 'bar' }, escape), 'bar')
})

test('basic: it handles deep objects with bracket notation', async assert => {
  const template = await compile('{foo.bar.baz[qux]}')
  assert.deepEqual(template({ foo: { bar: { baz: { qux: 'qux' } } }, qux: 'qux' }, escape), 'qux')
})

test('basic: it handles double bracket notation', async assert => {
  const template = await compile('{foo[bar][baz]}')
  assert.deepEqual(template({ foo: { bar: { baz: 'baz' } }, bar: 'bar', baz: 'baz' }, escape), 'baz')
})

test('basic: it handles triple bracket notation', async assert => {
  const template = await compile('{foo[bar][baz][qux]}')
  assert.deepEqual(template({ foo: { bar: { baz: { qux: 'qux' } } }, bar: 'bar', baz: 'baz', qux: 'qux' }, escape), 'qux')
})

test('basic: it handles mixed bracket and dot notation', async assert => {
  const template = await compile('{foo[bar].baz}')
  assert.deepEqual(template({ foo: { bar: { baz: 'baz' } }, bar: 'bar' }, escape), 'baz')
})

test('basic: it handles mixed double bracket and dot notation', async assert => {
  const template = await compile('{foo[bar].baz[qux]}')
  assert.deepEqual(template({ foo: { bar: { baz: { qux: 'qux' } } }, bar: 'bar', qux: 'qux' }, escape), 'qux')
})

test('basic: it handles two variables', async assert => {
  const template = await compile('{foo}{bar}')
  assert.deepEqual(template({ foo: 'foo', bar: 'bar' }, escape), 'foobar')
})

test('basic', async assert => {
  let template

  template = await compile('<div html="foo"></div>')
  assert.deepEqual(template(), '<div>foo</div>')

  template = await compile('<div text="foo"></div>')
  assert.deepEqual(template({}, escape), '<div>foo</div>')

  template = await compile('<div>{foo}</div>')
  assert.deepEqual(template({ foo: 'bar' }, escape), '<div>bar</div>')

  template = await compile('<div>{foo()}</div>')
  assert.deepEqual(template({ foo: () => 'bar' }, escape), '<div>bar</div>')

  template = await compile('<div>{foo("bar")}</div>')
  assert.deepEqual(template({ foo: bar => bar }, escape), '<div>bar</div>')

  template = await compile('<div>{foo.bar()}</div>')
  assert.deepEqual(template({ foo: { bar: () => 'baz' } }, escape), '<div>baz</div>')

  template = await compile('<div>{foo.bar.baz()}</div>')
  assert.deepEqual(template({ foo: { bar: { baz: () => 'qux' } } }, escape), '<div>qux</div>')

  template = await compile('<div>{foo(bar)}</div>')
  assert.deepEqual(template({ foo: string => string, bar: 'bar' }, escape), '<div>bar</div>')

  template = await compile('<div>{foo({ bar: baz })}</div>')
  assert.deepEqual(template({ foo: object => object.bar, baz: 'qux' }, escape), '<div>qux</div>')

  template = await compile('<div>{foo({ bar })}</div>')
  assert.deepEqual(template({ foo: object => object.bar, bar: 'baz' }, escape), '<div>baz</div>')

  template = await compile('<div>{foo(bar)}</div>')
  assert.deepEqual(template({ foo: array => array[0], bar: ['baz'] }, escape), '<div>baz</div>')

  template = await compile('<div>{foo(bar())}</div>')
  assert.deepEqual(template({ foo: string => string, bar: () => 'bar' }, escape), '<div>bar</div>')

  template = await compile('<div>{foo(bar(baz()))}</div>')
  assert.deepEqual(template({ foo: string => string, bar: string => string, baz: () => 'baz' }, escape), '<div>baz</div>')

  template = await compile('{foo}<div></div>')
  assert.deepEqual(template({ foo: 'bar' }, escape), 'bar<div></div>')

  template = await compile('<div></div>{foo}')
  assert.deepEqual(template({ foo: 'bar' }, escape), '<div></div>bar')

  template = await compile('<div>{foo} {bar}</div>')
  assert.deepEqual(template({ foo: 'bar', bar: 'baz' }, escape), '<div>bar baz</div>')

  template = await compile('<div>hello {world}</div>')
  assert.deepEqual(template({ world: 'world' }, escape), '<div>hello world</div>')

  template = await compile('<div class="foo" html="{bar}"></div>')
  assert.deepEqual(template({ bar: 'baz' }), '<div class="foo">baz</div>')

  template = await compile('<div class="foo" text="{bar}"></div>')
  assert.deepEqual(template({ bar: 'baz' }, value => { return value }), '<div class="foo">baz</div>')

  template = await compile('<div class="foo {bar}"></div>')
  assert.deepEqual(template({ bar: 'baz' }, value => { return value }), '<div class="foo baz"></div>')

  template = await compile('<div class="foo bar {baz}"></div>')
  assert.deepEqual(template({ baz: 'qux' }, value => { return value }), '<div class="foo bar qux"></div>')

  template = await compile('<div class="foo   bar    {baz}"></div>')
  assert.deepEqual(template({ baz: 'qux' }, value => { return value }), '<div class="foo bar qux"></div>')

  template = await compile('<div class="{foo} bar"></div>')
  assert.deepEqual(template({ foo: 'baz' }, value => { return value }), '<div class="baz bar"></div>')

  template = await compile('<div class="{foo} {bar}"></div>')
  assert.deepEqual(template({ foo: 'baz', bar: 'qux' }, value => { return value }), '<div class="baz qux"></div>')

  template = await compile('<div class="{foo} bar {baz}"></div>')
  assert.deepEqual(template({ foo: 'baz', baz: 'qux' }, value => { return value }), '<div class="baz bar qux"></div>')

  template = await compile('<div class="{foo}"></div>')
  assert.deepEqual(template({ foo: 'bar' }, escape), '<div class="bar"></div>')

  template = await compile('<div class.bind="foo"></div>')
  assert.deepEqual(template({ foo: 'bar' }, escape), '<div class="bar"></div>')

  template = await compile('<div class={foo}></div>')
  assert.deepEqual(template({ foo: 'bar' }, escape), '<div class="bar"></div>')

  template = await compile('<div></div>')
  assert.deepEqual(template(), '<div></div>')

  template = await compile('<h1>{title}</h1>')
  assert.deepEqual(template({ title: 'buxlabs' }, value => value), '<h1>buxlabs</h1>')

  template = await compile('<div html="{foo}"></div>')
  assert.deepEqual(template({ foo: 'bar' }), '<div>bar</div>')

  template = await compile('<div html="foo"></div>')
  assert.deepEqual(template({}), '<div>foo</div>')

  template = await compile('<div html="foo"></div>')
  assert.deepEqual(template({}), '<div>foo</div>')

  template = await compile('<div html="{foo}">xxx</div>')
  assert.deepEqual(template({ foo: 'bar' }), '<div>barxxx</div>')

  template = await compile('<div html="{foo}"></div>')
  assert.deepEqual(template({ foo: '<div>baz</div>' }), '<div><div>baz</div></div>')

  template = await compile('<div text="{foo}"></div>')
  assert.deepEqual(template({ foo: 'bar' }, escape), '<div>bar</div>')

  template = await compile('<div html={foo}></div>')
  assert.deepEqual(template({ foo: 'bar' }), '<div>bar</div>')

  template = await compile('<div html="{ foo }"></div>')
  assert.deepEqual(template({ foo: 'bar' }), '<div>bar</div>')

  template = await compile('<input type="text" value="{foo.bar}">')
  assert.deepEqual(template({ foo: { bar: 'baz' } }, escape), '<input type="text" value="baz">')

  template = await compile('<input type="text" value.bind="foo.bar">')
  assert.deepEqual(template({ foo: { bar: 'baz' } }), '<input type="text" value="baz">')

  template = await compile('<input type="checkbox" autofocus>')
  assert.deepEqual(template(), '<input type="checkbox" autofocus>')

  template = await compile('<input type="checkbox" checked>')
  assert.deepEqual(template(), '<input type="checkbox" checked>')

  template = await compile('<input type="checkbox" readonly>')
  assert.deepEqual(template(), '<input type="checkbox" readonly>')

  template = await compile('<input type="checkbox" disabled>')
  assert.deepEqual(template(), '<input type="checkbox" disabled>')

  template = await compile('<input type="checkbox" formnovalidate>')
  assert.deepEqual(template(), '<input type="checkbox" formnovalidate>')

  template = await compile('<input type="checkbox" multiple>')
  assert.deepEqual(template(), '<input type="checkbox" multiple>')

  template = await compile('<input type="checkbox" required>')
  assert.deepEqual(template(), '<input type="checkbox" required>')

  template = await compile('<input type="checkbox">')
  assert.deepEqual(template(), '<input type="checkbox">')

  template = await compile('<input type="checkbox" checked="{foo}">')
  assert.deepEqual(template({ foo: true }), '<input type="checkbox" checked>')

  template = await compile('<input type="checkbox" checked="{foo}">')
  assert.deepEqual(template({ foo: false }), '<input type="checkbox">')

  template = await compile('<input type="checkbox" checked.bind="foo">')
  assert.deepEqual(template({ foo: true }), '<input type="checkbox" checked>')

  template = await compile('<input type="checkbox" checked.bind="foo">')
  assert.deepEqual(template({ foo: false }), '<input type="checkbox">')

  template = await compile('<input type="checkbox" readonly.bind="foo">')
  assert.deepEqual(template({ foo: true }), '<input type="checkbox" readonly>')

  template = await compile('<input type="checkbox" readonly.bind="foo">')
  assert.deepEqual(template({ foo: false }), '<input type="checkbox">')

  template = await compile('<input type="checkbox" disabled.bind="foo">')
  assert.deepEqual(template({ foo: true }), '<input type="checkbox" disabled>')

  template = await compile('<input type="checkbox" disabled.bind="foo">')
  assert.deepEqual(template({ foo: false }), '<input type="checkbox">')

  template = await compile('<input type="checkbox" autofocus.bind="foo">')
  assert.deepEqual(template({ foo: true }), '<input type="checkbox" autofocus>')

  template = await compile('<input type="checkbox" autofocus.bind="foo">')
  assert.deepEqual(template({ foo: false }), '<input type="checkbox">')

  template = await compile('<input type="checkbox" formnovalidate.bind="foo">')
  assert.deepEqual(template({ foo: true }), '<input type="checkbox" formnovalidate>')

  template = await compile('<input type="checkbox" formnovalidate.bind="foo">')
  assert.deepEqual(template({ foo: false }), '<input type="checkbox">')

  template = await compile('<input type="checkbox" multiple.bind="foo">')
  assert.deepEqual(template({ foo: true }), '<input type="checkbox" multiple>')

  template = await compile('<input type="checkbox" multiple.bind="foo">')
  assert.deepEqual(template({ foo: false }), '<input type="checkbox">')

  template = await compile('<input type="checkbox" required.bind="foo">')
  assert.deepEqual(template({ foo: true }), '<input type="checkbox" required>')

  template = await compile('<input type="checkbox" required.bind="foo">')
  assert.deepEqual(template({ foo: false }), '<input type="checkbox">')

  template = await compile('<span class="icon {name}"></span>')
  assert.deepEqual(template({ name: 'buxus' }, escape), '<span class="icon buxus"></span>')

  template = await compile('<span class="icon icon-{name}"></span>')
  assert.deepEqual(template({ name: 'buxus' }, escape), '<span class="icon icon-buxus"></span>')

  template = await compile('<a href="blog/{name}">{title}</a>')
  assert.deepEqual(template({ name: 'foo', title: 'Foo' }, escape), '<a href="blog/foo">Foo</a>')

  template = await compile('<a href="blog/{name}">{title}</a>')
  assert.deepEqual(template({ name: 'foo', title: 'Foo' }, escape), '<a href="blog/foo">Foo</a>')

  template = await compile('<div>{foo} {bar}</div>')
  assert.deepEqual(template({ foo: 'foo', bar: 'bar' }, escape), '<div>foo bar</div>')

  template = await compile('{foo}')
  assert.deepEqual(template({ foo: undefined }, escape), 'undefined')

  template = await compile('{foo}')
  assert.deepEqual(template({ foo: null }, escape), 'null')

  template = await compile('<div>{foo} {bar}</div>')
  assert.deepEqual(template({ foo: 'foo', bar: 'bar' }, escape), '<div>foo bar</div>')

  template = await compile('<div tag="{tag}"></div>')
  assert.deepEqual(template({ tag: 'button' }), '<button></button>')

  template = await compile('<div tag="{tag}"></div>')
  assert.deepEqual(template({ tag: 'a' }), '<a></a>')

  template = await compile('<div tag.bind="tag"></div>')
  assert.deepEqual(template({ tag: 'button' }), '<button></button>')

  template = await compile('<div tag.bind="tag"></div>')
  assert.deepEqual(template({ tag: 'a' }), '<a></a>')

  template = await compile('<div>{42}</div>')
  assert.deepEqual(template({}, escape), '<div>42</div>')

  template = await compile('<div>{42} {42}</div>')
  assert.deepEqual(template({}, escape), '<div>42 42</div>')

  template = await compile('<div>{42} {foo}</div>')
  assert.deepEqual(template({ foo: 'bar' }, escape), '<div>42 bar</div>')

  template = await compile('<div>{"42"} {foo}</div>')
  assert.deepEqual(template({ foo: 'bar' }, escape), '<div>42 bar</div>')

  template = await compile('<div>{42 + 42}</div>')
  assert.deepEqual(template({ foo: 'bar' }, escape), '<div>84</div>')

  template = await compile('<div>1 + 2 = {1 + 2}</div>')
  assert.deepEqual(template({ foo: 'bar' }, escape), '<div>1 + 2 = 3</div>')

  template = await compile('<div html="{foo(bar())}"></div>')
  assert.deepEqual(template({ foo: string => string, bar: () => 'bar' }, escape), '<div>bar</div>')

  template = await compile('<div text="{foo(bar())}"></div>')
  assert.deepEqual(template({ foo: string => string, bar: () => 'bar' }, escape), '<div>bar</div>')

  template = await compile('{foo + 1}')
  assert.deepEqual(template({ foo: 0 }, escape), '1')

  template = await compile('{1 + foo}')
  assert.deepEqual(template({ foo: 0 }, escape), '1')

  template = await compile('{bar + foo}')
  assert.deepEqual(template({ foo: 0, bar: 1 }, escape), '1')

  template = await compile('{foo + bar}')
  assert.deepEqual(template({ foo: '<script>alert("foo")</script>', bar: 'hello' }, escape), '&lt;script&gt;alert(&quot;foo&quot;)&lt;/script&gt;hello')

  template = await compile('{foo + bar + baz}')
  assert.deepEqual(template({ foo: 0, bar: 1, baz: 2 }, escape), '3')

  template = await compile('{foo() + 1}')
  assert.deepEqual(template({ foo: () => 0 }, escape), '1')

  template = await compile('{foo() + bar() + 2}')
  assert.deepEqual(template({ foo: () => 0, bar: () => 1 }, escape), '3')

  template = await compile('{foo() + bar() + baz()}')
  assert.deepEqual(template({ foo: () => 0, bar: () => 1, baz: () => 2 }, escape), '3')

  template = await compile('{foo(bar) + baz}')
  assert.deepEqual(template({ foo: (bar) => bar, bar: 2, baz: 1 }, escape), '3')

  template = await compile('{"&"}')
  assert.deepEqual(template({}, escape), '&')

  template = await compile('<h5>#{index + 1} {translate("blog.author")}: {author}</h5>')
  assert.deepEqual(template({ index: 0, translate: () => 'author', author: 'Olek' }, escape), '<h5>#1 author: Olek</h5>')

  template = await compile('{foo + 1}')
  assert.deepEqual(template({ foo: 1 }, escape), '2')

  template = await compile('{foo.bar + 1}')
  assert.deepEqual(template({ foo: { bar: 1 } }, escape), '2')

  template = await compile('<button>{translate("buttons.search")}&nbsp;<span class="fa fa-search"></span></button>')
  assert.deepEqual(template({ translate () { return 'foo' } }, escape), '<button>foo&nbsp;<span class="fa fa-search"></span></button>')

  template = await compile('{foo.bar}<rescue>baz</rescue>')
  assert.deepEqual(template({}, escape), 'baz')

  template = await compile('{foo.bar}<rescue>baz</rescue>')
  assert.deepEqual(template({ foo: { bar: 'qux' } }, escape), 'qux')

  template = await compile('<style></style>')
  assert.deepEqual(template({}, escape), '<style></style>')

  template = await compile('<script></script>')
  assert.deepEqual(template({}, escape), '<script></script>')

  template = await compile('<script src="foo.js" defer></script>')
  assert.deepEqual(template({}, escape), '<script src="foo.js" defer></script>')

  template = await compile('<script src="foo.js" async></script>')
  assert.deepEqual(template({}, escape), '<script src="foo.js" async></script>')

  template = await compile('<template></template>')
  assert.deepEqual(template({}, escape), '<template></template>')

  template = await compile('<style>.foo{color:red}</style>')
  assert.deepEqual(template({}, escape), '<style>.foo{color:red}</style>')

  template = await compile('<script>console.log({ foo: "bar" })</script>')
  assert.deepEqual(template({}, escape), '<script>console.log({ foo: "bar" })</script>')

  template = await compile('<template><div></div></template>')
  assert.deepEqual(template({}, escape), '<template><div></div></template>')

  template = await compile('<template><div>{}</div></template>')
  assert.deepEqual(template({}, escape), '<template><div>{}</div></template>')

  template = await compile('<script type="text/javascript" src="./main.js"></script>')
  assert.deepEqual(template({}, escape), '<script type="text/javascript" src="./main.js"></script>')

  template = await compile('<style type="text/css">.foo{color:red}</style></script>')
  assert.deepEqual(template({}, escape), '<style type="text/css">.foo{color:red}</style>')

  template = await compile('<content for title>foo</content><title content="title"></title>')
  assert.deepEqual(template({}, escape), '<title>foo</title>')

  template = await compile('<img class="img-responsive" src="/assets/images/{photos[0]}" alt="Photo">')
  assert.deepEqual(template({ photos: ['foo.jpg', 'bar.jpg'] }, escape), '<img class="img-responsive" src="/assets/images/foo.jpg" alt="Photo">')

  template = await compile('<img src="./placeholder.png">')
  assert.deepEqual(template({ photos: ['foo.jpg', 'bar.jpg'] }, escape), '<img src="./placeholder.png">')
})
