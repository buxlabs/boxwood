import test from '../../../../helpers/test'
import compile from '../../../../helpers/compile'
import { normalize } from '../../../../helpers/string'
import { rollup } from 'rollup'
import svelte from 'rollup-plugin-svelte'
import { readFileSync, writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import escape from 'escape-html'

test('script: compiler="svelte"', async assert => {
  let template

  template = await compile(`
    <script compiler="svelte">import Foo from './Foo.html'; const target = document.getElementById('app'); new Foo({ target });</script>
  `, {
    compilers: {
      svelte: async (source, options) => {
        const input = join(__dirname, '../../../../fixtures/svelte', 'actual.js')
        writeFileSync(input, source)
        const bundle = await rollup({ input, plugins: [ svelte() ] })
        unlinkSync(input)
        const { code } = await bundle.generate({
          format: 'iife'
        })
        return code
      }
    }
  })

  assert.deepEqual(normalize(template({}, escape)), normalize('<script>' + readFileSync(join(__dirname, '../../../../fixtures/svelte', 'expected.js'), 'utf8')) + '</script>')
})
