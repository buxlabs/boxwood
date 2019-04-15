import test from '../../../../helpers/test'
import compile from '../../../../helpers/compile'
import escape from 'escape-html'

test('script: compiler="async"', async assert => {
  var { template } = await compile(`
    <div>foo</div><script compiler="async">const bar = 42</script><div>baz</div>
  `, {
    compilers: {
      async: (source) => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(source.replace('bar', 'qux'))
          }, 5)
        })
      }
    }
  })
  assert.deepEqual(template({}, escape), '<div>foo</div><script>const qux = 42</script><div>baz</div>')
})
