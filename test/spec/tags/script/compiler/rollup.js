import test from '../../../../helpers/test'
import compile from '../../../../helpers/compile'
import { normalize } from '../../../../helpers/string'
import { rollup } from 'rollup'
import { writeFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import escape from 'escape-html'

test('script: compiler="rollup"', async assert => {
  let template

  template = await compile(`
    <script compiler="rollup">console.log('x')</script>
  `, {
    compilers: {
      rollup: async (source, options) => {
        const input = join(tmpdir(), 'rollup.js')
        writeFileSync(input, source)
        const bundle = await rollup({ input })
        unlinkSync(input)
        const { code } = await bundle.generate({
          format: 'iife'
        })
        return code
      }
    }
  })

  assert.deepEqual(normalize(template({}, escape)), normalize(`<script>(function () { 'use strict'; console.log('x'); }());</script>`))
})
