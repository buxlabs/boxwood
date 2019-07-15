import test from 'ava'
import compile from '../../../helpers/compile'
import escape from 'escape-html'

test('script: returns empty string when script does not have a body', async assert => {
  const { template } = await compile('<script scoped></script>')
  assert.deepEqual(template({ foo: 2 }, escape), '')
})

test('script: access to passed variables in script tag through object destructuring assignment', async assert => {
  const { template } = await compile('<script scoped>const { foo } = scope;\nconsole.log(foo);</script>')
  assert.deepEqual(template({ foo: 2 }, escape), '<script>const scope = {"foo":2}\nconst { foo } = scope;\nconsole.log(foo);</script>')
})

test('script: access to passed variables through scope variable', async assert => {
  const { template } = await compile('<script scoped>console.log(scope.foo);</script>')
  assert.deepEqual(template({ foo: 2, bar: 'bar' }, escape), '<script>const scope = {"foo":2}\nconsole.log(scope.foo);</script>')
})

test('script: only used properties from scope variable should be inlined', async assert => {
  const { template } = await compile('<script scoped>{scope.ban}</script>')
  assert.deepEqual(template({ 
    foo: 2, 
    bar: 'bar',
    ban: [{ one: 1, two: 2, three: 3, four: 4 }] 
  }, escape), '<script>const scope = {"ban":[{"one":1,"two":2,"three":3,"four":4}]}\n{scope.ban}</script>')
})

test.skip('script: scoped', async assert => {
  const { template } = await compile('<script scoped>console.log(foo)</script>')
  assert.deepEqual(template({ foo: 2 }, escape), '<script>const foo = 2;\nconsole.log(foo)</script>')
})

test.skip('script: scoped with template', async assert => {
  const { template } = await compile(`
    <template foo>
      <input name="{name}">
      <script scoped>console.log(name)</script>
    </template>
    <foo name="bar" />
  `)
  assert.deepEqual(template({ foo: 2 }, escape), '<input name="bar"><script>const name = "bar";\nconsole.log(name)</script>')
})
