import test from '../../../../helpers/test'
import compile from '../../../../helpers/compile'

test('script: compiler="async"', async assert => {
  const template = await compile(`
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
  assert.deepEqual(template({}, html => html), '<div>foo</div><script>const qux = 42</script><div>baz</div>')
})
