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

test('script: compiler="preact"', async assert => {
  let template

  template = await compile(`
    <div id='app'></div>
    <script compiler="preact">
      import { render } from 'preact'
      const Foo = ({ bar }) => {
        return (<span>{bar}</span>)
      }
      render(
        <Foo bar="baz" />,
        document.getElementById('app')
      )
    </script>
  `, {
    compilers: {
      preact: async (source, options) => {
        const input = join(tmpdir(), 'preact.js')
        writeFileSync(input, source)
        const bundle = await rollup({
          input,
          plugins: [
            babel({
              plugins: [
                ['@babel/plugin-transform-react-jsx', { 'pragma': 'h' }]
              ]
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
          ]
        })
        unlinkSync(input)
        const { code } = await bundle.generate({
          format: 'iife'
        })
        return code
      }
    }
  })

  assert.deepEqual(normalize(template({}, html => html)), normalize(`<div id="app"></div><script>` + readFileSync(join(__dirname, '../../../../fixtures/preact', 'expected.js'), 'utf8') + `</script>`))
})
