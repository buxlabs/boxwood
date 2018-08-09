const { equal } = require('assert')
const compile = require('../helpers/compile')

console.time('loops')

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

equal(compile('<for baz in qux>{foo({ bar: baz })}</for>')({ foo: object => object.bar, qux: ['qux', 'quux'] }, html => html), 'quxquux')

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

equal(compile('<for number in range="0...10">{number}</for>')({}, html => html), '0123456789')
equal(compile('<for number in range="0..10">{number}</for>')({}, html => html), '012345678910')
equal(compile('<for number in range="10">{number}</for>')({}, html => html), '012345678910')

equal(compile(`<for month in='{["Styczeń", "Luty", "Marzec"]}'>{month}</for>`)({}, html => html), 'StyczeńLutyMarzec')
equal(compile(`<for foo in='{[bar, baz]}'>{foo}</for>`)({ bar: 'bar', baz: 'baz' }, html => html), 'barbaz')
// equal(compile(`<for foo in='{[{ key: 'bar' }, { key: 'baz' }]}'>{foo.key}</for>`)({}, html => html), 'barbaz')

equal(compile(`{baz}<for foo in bar><for baz in foo>{baz.quz}</for></for>{baz}`)({
  bar: [ [{ quz: 1 }], [{ quz: 2 }] ],
  baz: 'qux'
}, html => html), 'qux12qux')

equal(compile(`{baz}<for foo in bar><for baz in foo.quz>{baz}</for></for>{baz}`)({
  bar: [ { quz: [1, 2, 3] }, { quz: [4, 5, 6] } ],
  baz: 'qux'
}, html => html), 'qux123456qux')

equal(compile('<for key and value in foo>{key}{value}</for>')({ foo: { bar: 'baz', ban: 'qux' } }, html => html), 'barbazbanqux')
equal(compile('<for key and value in="{foo}">{key}{value}</for>')({ foo: { bar: 'baz', ban: 'qux' } }, html => html), 'barbazbanqux')

equal(compile('<foreach foo in bar>{foo}</foreach>')({ bar: [1, 2, 3] }, html => html), '123')

equal(compile('<foreach foo and baz in bar>{foo}{baz}</foreach>')({
  bar: new Map([ ['qux', 1], ['quux', 2] ])
}, html => html), '1qux2quux')

equal(compile('<foreach foo in bar>{foo}</foreach>')({
  bar: new Set([1, 2, 3, 4, 5])
}, html => html), '12345')

equal(compile(`<each foo in bar>{foo}</each>`)({
  bar: {
    each: function (callback) {
      const elements = [1, 2, 3]
      elements.forEach(callback)
    }
  }
}, html => html), '123')

console.timeEnd('loops')
