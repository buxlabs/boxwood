import { readFileSync } from 'fs'
import { join } from 'path'
import compile from './helpers/compile'
import t from 'ava'

t('conditions', async assert => {
  console.time('conditions')

  await test('complex1', { divider: true }, `<div class="divider"></div>`, assert)
  await test('complex1', { divider: undefined, header: true, name: 'foobar' }, `foobar`, assert)
  await test('complex1', {
    divider: false,
    header: false,
    name: 'foobar',
    type: 'button',
    anchorClass: 'foo',
    url: '#',
    iconClass: 'bar'
  }, `<button class="foo" href="#"><i class="bar"></i>foobar</button>`, assert)
  await test('complex1', {
    divider: false,
    header: false,
    name: 'foobar',
    type: false,
    anchorClass: 'foo',
    url: '#',
    iconClass: 'bar'
  }, `<a class="foo" href="#"><i class="bar"></i>foobar</a>`, assert)
  console.timeEnd('conditions')
})

async function test (name, data, expected, assert) {
  const dir = join(__dirname, 'fixtures/conditions')
  const file1 = join(dir, name, 'actual.html')
  const content1 = readFileSync(file1, 'utf8')
  const template = await compile(content1)
  const actual = template(data, html => html)
  assert.deepEqual(actual.trim(), expected.trim())
}
