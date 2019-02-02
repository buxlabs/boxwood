import test from '../helpers/test'
import compile from '../helpers/compile'
import { normalize } from '../helpers/string'
import { readFile } from '../helpers/fs'
import { join } from 'path'
import escape from 'escape-html'

test('acceptance: components-in-a-loop', async assert => {
  await suite('components-in-a-loop', assert)
})

test('acceptance: same-attributes', async assert => {
  await suite('same-attributes', assert)
})

test('acceptance: objects-as-parameters', async assert => {
  await suite('objects-as-parameters', assert)
})

test('acceptance: components-with-box-model-attributes', async assert => {
  await suite('components-with-box-model-attributes', assert)
})

async function suite (name, assert) {
  const dir = join(__dirname, '../fixtures/acceptance', name)
  const path1 = join(dir, 'actual.html')
  const path2 = join(dir, 'expected.html')
  const path3 = join(dir, 'data.json')
  const content1 = await readFile(path1)
  const content2 = await readFile(path2)
  const content3 = await readFile(path3)
  const template = await compile(content1, {
    paths: [dir],
    languages: ['pl', 'en']
  })
  const data = JSON.parse(content3)
  const actual = normalize(template(data, escape))
  const expected = normalize(content2)
  assert.deepEqual(actual, expected)
}
