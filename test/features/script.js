const { equal } = require('assert')
const compile = require('../helpers/compile')
// const svelte = require('svelte')

console.time('script')

equal(compile('<script store>console.log(STORE.foo)</script>')({ foo: 2 }, html => html), '<script>const STORE = {"foo":2}\nconsole.log(STORE.foo)</script>')
equal(compile('<script store>const { foo } = STORE</script>')({ foo: 1 }, html => html), '<script>const STORE = {"foo":1}\nconst { foo } = STORE</script>')
equal(compile('<script store>const { foo, bar } = STORE</script>')({ foo: 1, bar: 2 }, html => html),
  '<script>const STORE = {"foo":1,"bar":2}\nconst { foo, bar } = STORE</script>'
)
equal(compile('<script store>const { foo } = STORE</script>')({ foo: 'some text' }, html => html),
  '<script>const STORE = {"foo":"some text"}\nconst { foo } = STORE</script>'
)
equal(compile('<script store>const { foo } = STORE</script>')({ "foo": 'some text' }, html => html),
  '<script>const STORE = {"foo":"some text"}\nconst { foo } = STORE</script>'
)
equal(compile('<script store>const { foo } = STORE</script>')({ foo: ['bar', 'baz']}, html => html),
  '<script>const STORE = {"foo":["bar","baz"]}\nconst { foo } = STORE</script>'
)
equal(compile('<script store>const bar = STORE.foo[0]</script>')({ foo: ['bar', 'baz']}, html => html),
  '<script>const STORE = {"foo":["bar","baz"]}\nconst bar = STORE.foo[0]</script>'
)
equal(compile('<script store>const { foo } = STORE</script>')({ foo: { bar: 'baz' } }, html => html),
  '<script>const STORE = {"foo":{"bar":"baz"}}\nconst { foo } = STORE</script>'
)
equal(compile(`
  <script store>const button = document.querySelector("button")\nbutton.innerText = STORE.text\n</script>`
  )({ "text": 'fooBar' }, html => html),
  `<script>const STORE = {"text":"fooBar"}\nconst button = document.querySelector("button")\nbutton.innerText = STORE.text\n</script>`
)

equal(compile(`
  <script store>const isHidden = STORE.isHidden</script>`
  )({ isHidden: true }, html => html),
  `<script>const STORE = {"isHidden":true}\nconst isHidden = STORE.isHidden</script>`
)

// equal(compile('<script store>const { getDate } = STORE</script>')({ getDate: function () {} }, html => html),
//   '<script>const STORE = {"getDate": function () {}"}\nconst { getDate } = STORE</script>'
// )

equal(compile(`
  <script compiler="foo2bar">const foo = 42</script>`, { compilers: { foo2bar: (source) => { return source.replace('foo', 'bar') } } }
  )({}, html => html),
  `<script>const bar = 42</script>`
)

equal(compile(`
  <script compiler="foo2bar" options='{"baz": "qux"}'>const foo = 42</script>`, { compilers: { foo2bar: (source, options) => { return source.replace('foo', options.baz) } } }
  )({}, html => html),
  `<script>const qux = 42</script>`
)

// equal(compile(`
//   <script compiler="svelte" options='{"name": "Wizard"}'>import Foo from './Foo.html'</script>`, {
//     compilers: {
//       svelte: (source, options) => {
//         const { js } = svelte.compile(source, { format: 'iife', ...options })
//         console.log(js.code)
//         return js.code
//       }
//     }
// })({}, html => html),`<script>const bar = 42</script>`)


console.timeEnd('script')
