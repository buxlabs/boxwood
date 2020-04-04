const { compile, escape } = require('..')
const { join } = require('path')
const { promises: { readFile, writeFile } } = require('fs')

async function build () {
  const input = await readFile(join(__dirname, 'index.html'), 'utf8')
  const { template } = await compile(input, {
    paths: [__dirname]
  })
  const output = template({}, escape)
  await writeFile(join(__dirname, '../index.html'), output)
}

build()
