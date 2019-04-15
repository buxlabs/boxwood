import test from '../../../../helpers/test'
import compile from '../../../../helpers/compile'
import escape from 'escape-html'

test('script: compiler="sync"', async assert => {
  var { template } = await compile(`
    <script compiler="sync">const foo = 42</script>
  `, {
    compilers: {
      sync: (source) => {
        return source.replace('foo', 'bar')
      }
    }
  })
  assert.deepEqual(template({}, escape), '<script>const bar = 42</script>')
})

test('script: compiler="sync" with options', async assert => {
  var { template } = await compile(`
    <script compiler="sync" options='{"baz": "qux"}'>const foo = 42</script>
  `, {
    compilers: {
      sync: (source, options) => {
        return source.replace('foo', options.baz)
      }
    }
  })
  assert.deepEqual(template({}, escape), '<script>const qux = 42</script>')
})
