import test from 'ava'
import compile from '../../../helpers/compile'
import escape from 'escape-html'

test('script: store', async assert => {
  var { template } = await compile('<script store>console.log(STORE.foo)</script>')
  assert.deepEqual(template({ foo: 2 }, escape), '<script>const STORE = {"foo":2}\nconsole.log(STORE.foo)</script>')

  var { template } = await compile('<script store>const { foo } = STORE</script>')
  assert.deepEqual(template({ foo: 1 }, escape), '<script>const STORE = {"foo":1}\nconst { foo } = STORE</script>')

  var { template } = await compile('<script store>const { foo, bar } = STORE</script>')
  assert.deepEqual(template({ foo: 1, bar: 2 }, escape), '<script>const STORE = {"foo":1,"bar":2}\nconst { foo, bar } = STORE</script>')

  var { template } = await compile('<script store>const { foo } = STORE</script>')
  assert.deepEqual(template({ foo: 'some text' }, escape), '<script>const STORE = {"foo":"some text"}\nconst { foo } = STORE</script>')

  var { template } = await compile('<script store>const { foo } = STORE</script>')
  assert.deepEqual(template({ 'foo': 'some text' }, escape), '<script>const STORE = {"foo":"some text"}\nconst { foo } = STORE</script>')

  var { template } = await compile('<script store>const { foo } = STORE</script>')
  assert.deepEqual(template({ foo: ['bar', 'baz'] }, escape), '<script>const STORE = {"foo":["bar","baz"]}\nconst { foo } = STORE</script>')

  var { template } = await compile('<script store>const bar = STORE.foo[0]</script>')
  assert.deepEqual(template({ foo: ['bar', 'baz'] }, escape), '<script>const STORE = {"foo":["bar","baz"]}\nconst bar = STORE.foo[0]</script>')

  var { template } = await compile('<script store>const { foo } = STORE</script>')
  assert.deepEqual(template({ foo: ['bar', 'baz'] }, escape), '<script>const STORE = {"foo":["bar","baz"]}\nconst { foo } = STORE</script>')

  var { template } = await compile('<script store>const button = document.querySelector("button")\nbutton.innerText = STORE.text\n</script>')
  assert.deepEqual(template({ 'text': 'fooBar' }, escape), '<script>const STORE = {"text":"fooBar"}\nconst button = document.querySelector("button")\nbutton.innerText = STORE.text\n</script>')

  var { template } = await compile('<script store>const isHidden = STORE.isHidden</script>')
  assert.deepEqual(template({ isHidden: true }, escape), '<script>const STORE = {"isHidden":true}\nconst isHidden = STORE.isHidden</script>')
})
