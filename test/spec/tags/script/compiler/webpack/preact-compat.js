import test from '../../../../../helpers/test'
import compile from '../../../../../helpers/compile'
import { normalize } from '../../../../../helpers/string'
import { readFileSync, writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import escape from 'escape-html'
import webpack from 'webpack'

test('script: compiler="webpack/preact-compat"', async assert => {
  let template

  template = await compile(`
    <div id='app'></div>
    <script compiler="webpack/preact-compat">
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
      'webpack/preact-compat': async (source, options) => {
        const dir = join(tmpdir(), 'webpack')
        if (!existsSync(dir)) mkdirSync(dir)
        const input = join(dir, 'preact-compat.jsx')
        writeFileSync(input, source)
        const filename = 'actual.js'
        await new Promise((resolve, reject) => {
          webpack({
            mode: 'development',
            entry: input,
            output: {
              path: dir,
              filename
            },
            module: {
              rules: [
                {
                  test: /\.jsx?$/,
                  exclude: /node_modules/,
                  loader: 'babel-loader',
                  options: {
                    'plugins': [
                      ['transform-react-jsx', { 'pragma': 'h' }]
                    ]
                  }
                }
              ]
            },
            resolve: {
              alias: {
                'react': 'preact-compat',
                'react-dom': 'preact-compat'
              },
              modules: [
                join(__dirname, '../../../../../../node_modules')
              ]
            }
          }, (err, stats) => {
            if (err) { return reject(err) }
            resolve()
          })
        })
        const output = join(dir, filename)
        const code = readFileSync(output, 'utf8')
        unlinkSync(input)
        unlinkSync(output)
        return code
      }
    }
  })

  assert.deepEqual(normalize(template({}, escape)), normalize(`<div id="app"></div><script>` + readFileSync(join(__dirname, '../../../../../fixtures/script/compiler/webpack/preact-compat', 'expected.js'), 'utf8') + `</script>`))
})
