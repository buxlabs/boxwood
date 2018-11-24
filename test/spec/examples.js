import test from '../helpers/test'
import compile from '../helpers/compile'
import { normalize } from '../helpers/string'
import { readFile } from '../helpers/fs'
import { join } from 'path'

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

test('example: i18n', async assert => {
  await assert.throws(
    suite('i18n', { language: 'pl' }, assert),
    /Translation already exists/
  )
})

async function suite (name, data = {}, assert) {
  const dir = join(__dirname, '../fixtures/examples', name)
  const path1 = join(dir, 'actual.html')
  const path2 = join(dir, 'expected.html')
  const content1 = await readFile(path1)
  const content2 = await readFile(path2)
  const template = await compile(content1, {
    paths: [dir],
    languages: ['pl', 'en']
  })
  const actual = normalize(template(data, html => html))
  const expected = normalize(content2)
  assert.deepEqual(actual, expected)
}
