const test = require('ava')
const compile = require('../helpers/compile')
const { normalize } = require('../helpers/string')
const { join } = require('path')
const fs = require('fs')
const util = require('util')
const { escape } = require('../..')

const readFile = util.promisify(fs.readFile)

test('example: home', async assert => {
  const { actual, expected } = await suite('home')
  assert.deepEqual(actual, expected)
})

test('example: slots', async assert => {
  const { actual, expected } = await suite('slots')
  assert.deepEqual(actual, expected)
})

test.skip('example: scope', async assert => {
  const { actual, expected } = await suite('scope')
  assert.deepEqual(actual, expected)
})

test.skip('example: theme', async assert => {
  const { actual, expected } = await suite('theme')
  assert.deepEqual(actual, expected)
})

async function suite (name, data = {}) {
  const dir = join(__dirname, '../fixtures/examples', name)
  const path1 = join(dir, 'actual.html')
  const path2 = join(dir, 'expected.html')
  const content1 = await readFile(path1, 'utf8')
  const content2 = await readFile(path2, 'utf8')
  var { template } = await compile(content1, {
    paths: [dir],
    languages: ['pl', 'en']
  })
  const actual = normalize(template(data, escape))
  const expected = normalize(content2)
  return { actual, expected }
}
