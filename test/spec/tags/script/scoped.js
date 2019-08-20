import test from 'ava'
import { join } from 'path'
import compile from '../../../helpers/compile'
import escape from 'escape-html'

test('script: returns empty string when script does not have a body', async assert => {
  const { template } = await compile('<script scoped></script>')
  assert.deepEqual(template({ foo: 2 }, escape), '')
})

test('script: access to passed variables in script tag through object destructuring assignment', async assert => {
  const { template } = await compile('<script scoped>const { foo } = scope;\nconsole.log(foo);</script>')
  assert.truthy(template({ foo: 2 }, escape).includes('const scope = {"foo":2}'))
})

test('script: access to passed variables through scope variable', async assert => {
  const { template } = await compile('<script scoped>console.log(scope.foo);</script>')
  assert.truthy(template({ foo: 2, bar: 'bar' }, escape).includes('const scope = {"foo":2}'))
})

test('script: only used properties from scope variable should be inlined', async assert => {
  const { template } = await compile('<script scoped>scope.ban.forEach(element => console.log(element))</script>')  
  assert.truthy(template({ 
    foo: 2, 
    bar: 'bar',
    ban: [{ one: 1, two: 2, three: 3, four: 4 }] 
  }, escape).includes('const scope = {"ban":[{"one":1,"two":2,"three":3,"four":4}]}'))
})

test('script: import', async assert => {
  const { template } = await compile(`
    <script scoped>
      import foo from "./foo"
      foo()
    </script>
  `, {
    script: {
      paths: [join(__dirname, '../../../fixtures/script/scoped/import')]
    }
  })
  assert.truthy(template({}, escape).includes('function foo'))
})
