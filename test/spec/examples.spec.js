const test = require('ava')
const compile = require('../helpers/compile')
const { normalize } = require('../helpers/string')
const { join } = require('path')
const fs = require('fs')
const util = require('util')
const escape = require('escape-html')

const readFile = util.promisify(fs.readFile)

test('example: fizzbuzz', async assert => {
  await suite('fizzbuzz', {}, assert)
})

test('example: grid', async assert => {
  await suite('grid', {
    collection: {
      each: callback => {
        const elements = [1, 2, 3, 4]
        elements.forEach(callback)
      }
    }
  }, assert)
})

test('example: home', async assert => {
  await suite('home', {}, assert)
})

test('example: scope', async assert => {
  await suite('scope', {}, assert)
})

test('example: slots', async assert => {
  await suite('slots', {}, assert)
})

test('example: theme', async assert => {
  await suite('theme', {}, assert)
})

test('example: inlining', async assert => {
  await suite('inlining', {}, assert)
})

async function suite (name, data = {}, assert) {
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
  assert.deepEqual(actual, expected)
}
