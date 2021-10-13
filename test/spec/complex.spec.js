const test = require('ava')
const compile = require('../helpers/compile')
const { join } = require('path')
const { escape } = require('../..')
const fs = require('fs')
const util = require('util')

const readFile = util.promisify(fs.readFile)

test.skip('complex: it goes to the if branch', async assert => {
  const actual = await suite(
    'nested-conditions',
    { divider: true }
  )
  assert.deepEqual(actual, '<div class="divider"></div>')
})

test.skip('complex: it goes to the elseif branch', async assert => {
  const actual = await suite(
    'nested-conditions',
    { header: true, name: 'foo' }
  )
  assert.deepEqual(actual, 'foo')
})

test.skip('complex: it goes to the else branch and first if statement', async assert => {
  const actual = await suite('nested-conditions', {
    divider: false,
    header: false,
    name: 'foobar',
    type: 'button',
    anchorClass: 'foo',
    url: '/foo',
    iconClass: 'bar'
  })
  assert.deepEqual(actual, `<button class="foo" href="/foo"><i class="bar"></i>foobar</button>`)
})

test.skip('complex: it goes to the else branch and second if statement', async assert => {
  const actual = await suite('nested-conditions', {
    divider: false,
    header: false,
    name: 'foobar',
    type: false,
    anchorClass: 'foo',
    url: '/foo',
    iconClass: 'bar'
  })
  assert.deepEqual(actual, `<a class="foo" href="/foo"><i class="bar"></i>foobar</a>`)
})

async function suite (name, data) {
  const dir = join(__dirname, '../fixtures/complex')
  const file1 = join(dir, name, 'actual.html')
  const content1 = await readFile(file1, 'utf8')
  var { template } = await compile(content1)
  return template(data, escape)
}
