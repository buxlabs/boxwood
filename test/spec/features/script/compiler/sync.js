import test from '../../../../helpers/test'
import compile from '../../../../helpers/compile'

test('script: compiler="sync"', async assert => {
  const template = await compile(`
    <script compiler="sync">const foo = 42</script>
  `, {
    compilers: {
      sync: (source) => {
        return source.replace('foo', 'bar')
      }
    }
  })
  assert.deepEqual(template({}, html => html), '<script>const bar = 42</script>')
})

test('script: compiler="sync" with options', async assert => {
  const template = await compile(`
    <script compiler="sync" options='{"baz": "qux"}'>const foo = 42</script>
  `, {
    compilers: {
      sync: (source, options) => {
        return source.replace('foo', options.baz)
      }
    }
  })
  assert.deepEqual(template({}, html => html), '<script>const qux = 42</script>')
})
