import test from 'ava'
import compile from '../../../../helpers/compile'
import { normalize } from '../../../../helpers/string'
import coffeescript from 'coffeescript'

test('script: coffeescript', async assert => {
  let template
  console.time('script: coffeescript')

  template = await compile(`
    <script compiler="coffeescript">console.log "Hello, world!"</script>
  `, {
    compilers: {
      coffeescript (source, options) {
        return coffeescript.compile(source)
      }
    }
  })

  assert.deepEqual(normalize(template({}, html => html)), normalize('<script>(function () { console.log("Hello, world!"); }).call(this);</script>'))

  console.timeEnd('script: coffeescript')
})
