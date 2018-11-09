import test from 'ava'
import compile from '../helpers/compile'
// const svelte = require('svelte')

test('script', async assert => {
  let template
  console.time('script')

  template = await compile('<script store>console.log(STORE.foo)</script>')
  assert.deepEqual(template({ foo: 2 }, html => html), '<script>const STORE = {"foo":2}\nconsole.log(STORE.foo)</script>')

  template = await compile('<script store>const { foo } = STORE</script>')
  assert.deepEqual(template({ foo: 1 }, html => html), '<script>const STORE = {"foo":1}\nconst { foo } = STORE</script>')

  template = await compile('<script store>const { foo, bar } = STORE</script>')
  assert.deepEqual(template({ foo: 1, bar: 2 }, html => html), '<script>const STORE = {"foo":1,"bar":2}\nconst { foo, bar } = STORE</script>')

  template = await compile('<script store>const { foo } = STORE</script>')
  assert.deepEqual(template({ foo: 'some text' }, html => html), '<script>const STORE = {"foo":"some text"}\nconst { foo } = STORE</script>')

  template = await compile('<script store>const { foo } = STORE</script>')
  assert.deepEqual(template({ "foo": 'some text' }, html => html), '<script>const STORE = {"foo":"some text"}\nconst { foo } = STORE</script>')

  template = await compile('<script store>const { foo } = STORE</script>')
  assert.deepEqual(template({ foo: ['bar', 'baz']}, html => html), '<script>const STORE = {"foo":["bar","baz"]}\nconst { foo } = STORE</script>')

  template = await compile('<script store>const bar = STORE.foo[0]</script>')
  assert.deepEqual(template({ foo: ['bar', 'baz']}, html => html), '<script>const STORE = {"foo":["bar","baz"]}\nconst bar = STORE.foo[0]</script>')

  template = await compile('<script store>const { foo } = STORE</script>')
  assert.deepEqual(template({ foo: ['bar', 'baz']}, html => html), '<script>const STORE = {"foo":["bar","baz"]}\nconst { foo } = STORE</script>')

  template = await compile('<script store>const button = document.querySelector("button")\nbutton.innerText = STORE.text\n</script>')
  assert.deepEqual(template({ "text": 'fooBar' }, html => html), '<script>const STORE = {"text":"fooBar"}\nconst button = document.querySelector("button")\nbutton.innerText = STORE.text\n</script>')

  template = await compile('<script store>const isHidden = STORE.isHidden</script>')
  assert.deepEqual(template({ isHidden: true }, html => html), '<script>const STORE = {"isHidden":true}\nconst isHidden = STORE.isHidden</script>')

  template = await compile('<script compiler="foo2bar">const foo = 42</script>', {  compilers: { foo2bar: (source) => { return source.replace('foo', 'bar') } } })
  assert.deepEqual(template({}, html => html), '<script>const bar = 42</script>')

  // equal(compile('<script store>const { getDate } = STORE</script>')({ getDate: function () {} }, html => html),
  //   '<script>const STORE = {"getDate": function () {}"}\nconst { getDate } = STORE</script>'
  // )

  template = await compile(`<script compiler="foo2bar" options='{"baz": "qux"}'>const foo = 42</script>`, { compilers: { foo2bar: (source, options) => { return source.replace('foo', options.baz) } } })
  assert.deepEqual(template({}, html => html), '<script>const qux = 42</script>')

  template = await compile(`<script compiler="async">const foo = 42</script>`, {
    compilers: {
      async: (source) => {
        return new Promise(resolve => {
          resolve(source.replace('foo', 'bar'))
        })
      }
    }
  })

  assert.deepEqual(template({}, html => html), '<script>const bar = 42</script>')

  template = await compile(`<div>foo</div><script compiler="async">const bar = 42</script><div>baz</div>`, {
    compilers: {
      async: (source) => {
        return new Promise(resolve => {
          resolve(source.replace('bar', 'qux'))
        })
      }
    }
  })

  assert.deepEqual(template({}, html => html), '<div>foo</div><script>const qux = 42</script><div>baz</div>')

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
})
