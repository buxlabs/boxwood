const test = require('ava')
const { join } = require('path')
const compile = require('../../../helpers/compile')
const { escape } = require('../../../..')

test('script[scoped]: returns empty string when script does not have a body', async assert => {
  const { template } = await compile('<script scoped></script>')
  assert.deepEqual(template({ foo: 2 }, escape), '')
})

test('script[scoped]: access to passed variables in script tag through object destructuring assignment', async assert => {
  const { template } = await compile('<script scoped>const { foo } = scope;\nconsole.log(foo);</script>')
  assert.truthy(template({ foo: 2 }, escape).includes('{"foo":2}'))
})

test('script[scoped]: access to passed variables through scope variable', async assert => {
  const { template } = await compile('<script scoped>console.log(scope.foo);</script>')
  assert.truthy(template({ foo: 2, bar: 'bar' }, escape).includes('{"foo":2}'))
})

test('script[scoped]: only used properties from scope variable should be inlined', async assert => {
  const { template } = await compile('<script scoped>scope.ban.forEach(element => console.log(element))</script>')
  assert.truthy(template({
    foo: 2,
    bar: 'bar',
    ban: [{ one: 1, two: 2, three: 3, four: 4 }]
  }, escape).includes('{"ban":[{"one":1,"two":2,"three":3,"four":4}]}'))
})

test('script[scoped]: import local dependencies', async assert => {
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

test('script[scoped]: import dependencies from node_modules', async assert => {
  const { template } = await compile(`
    <script scoped>
      import { capitalize } from "pure-utilities/string"
      capitalize("foo")
    </script>
  `, {
    script: {
      paths: [join(__dirname, '../../../fixtures/script/scoped/import')],
      resolve: {
        customResolveOptions: {
          moduleDirectory: join(__dirname, '../../../../node_modules')
        }
      }
    }
  })
  assert.truthy(template({}, escape).includes('function capitalize'))
})
