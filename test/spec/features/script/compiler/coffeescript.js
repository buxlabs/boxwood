import test from '../../../../helpers/test'
import compile from '../../../../helpers/compile'
import { normalize } from '../../../../helpers/string'
import coffeescript from 'coffeescript'

test('script: compiler="coffeescript"', async assert => {
  let template

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
})
