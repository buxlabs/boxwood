const test = require('ava')
const compile = require('../../helpers/compile')
const escape = require('escape-html')
const path = require('path')

test('[partial]', async assert => {
  const { template } = await compile(`<head partial="./head.html"></head>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, escape), '<head><meta charset="utf-8"></head>')
})

test('[partial]: passes attributes', async assert => {
  const { template } = await compile(`<div partial="./foo.html" bar="qux" baz="quux"></div>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial/attributes') ]
  })
  assert.deepEqual(template({}, escape), '<div>quxquux</div>')
})

test('partial: passes attributes and handles expressions', async assert => {
  const { template } = await compile(`<div partial="./bar.html" foo qux="{qux}"></div>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial/attributes') ]
  })
  assert.deepEqual(template({
    qux: (quux) => quux,
    quux: "quux"
  }, escape), '<div><a class="bar" href="quuxquuux"></a></div>')
})
