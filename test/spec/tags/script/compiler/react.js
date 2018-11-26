import test from '../../../../helpers/test'
import compile from '../../../../helpers/compile'
import { normalize } from '../../../../helpers/string'
import { rollup } from 'rollup'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { readFileSync, writeFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import escape from 'escape-html'

test('script: compiler="react"', async assert => {
  let template

  template = await compile(`
    <div id='app'></div>
    <script compiler="react">
      import React from 'react'
      import ReactDOM from 'react-dom'
      const Foo = ({ bar }) => {
        return (<span>{bar}</span>)
      }
      ReactDOM.render(
        <Foo bar="baz" />,
        document.getElementById('app')
      )
    </script>
  `, {
    compilers: {
      react: async (source, options) => {
        const input = join(tmpdir(), 'react.js')
        writeFileSync(input, source)
        const bundle = await rollup({
          input,
          plugins: [
            babel({
              plugins: [
                ['@babel/plugin-transform-react-jsx']
              ],
              compact: false
            }),
            resolve({
              module: true,
              jsnext: true,
              main: true,
              browser: true,
              customResolveOptions: {
                moduleDirectory: join(__dirname, '../../../../../node_modules')
              }
            }),
            commonjs()
          ],
          onwarn (warning, warn) {}
        })
        unlinkSync(input)
        const { code } = await bundle.generate({
          format: 'iife'
        })
        return code
      }
    }
  })

  assert.deepEqual(normalize(template({}, escape)), normalize(`<div id="app"></div><script>` + readFileSync(join(__dirname, '../../../../fixtures/react', 'expected.js'), 'utf8') + `</script>`))
})
