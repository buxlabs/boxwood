import test from 'ava'
import { readFileSync } from 'fs'
import { join } from 'path'
import compile from '../helpers/compile'

test('examples', async assert => {
  console.time('examples')
  await suite('fizzbuzz', {}, assert)
  await suite('grid', {
    collection: {
      each: callback => {
        const elements = [1, 2, 3, 4]
        elements.forEach(callback)
      }
    }
  }, assert)
  console.timeEnd('examples')
})

function normalize (string) {
  return string.replace(/\s+/g, '')
}

async function suite (name, data = {}, assert) {
  const dir = join(__dirname, 'fixtures/examples')
  const file1 = join(dir, name, 'actual.html')
  const file2 = join(dir, name, 'expected.html')
  const content1 = readFileSync(file1, 'utf8')
  const template = await compile(content1)
  const actual = normalize(template(data, html => html))
  const expected = normalize(readFileSync(file2, 'utf8'))
  assert.deepEqual(actual, expected)
}
