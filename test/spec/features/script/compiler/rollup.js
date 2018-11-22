import test from 'ava'
import compile from '../../../../helpers/compile'
import { normalize } from '../../../../helpers/string'
import { rollup } from 'rollup'
import { writeFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

test('script: rollup', async assert => {
  let template
  console.time('script: rollup')

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

  assert.deepEqual(normalize(template({}, html => html)), normalize(`<script>(function () { 'use strict'; console.log('x'); }());</script>`))

  console.timeEnd('script: rollup')
})
