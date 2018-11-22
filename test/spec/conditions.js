import { readFileSync } from 'fs'
import { join } from 'path'
import compile from '../helpers/compile'
import test from 'ava'

test('conditions (files)', async assert => {
  console.time('conditions (files)')

  await suite('complex1', { divider: true }, `<div class="divider"></div>`, assert)
  await suite('complex1', { divider: undefined, header: true, name: 'foobar' }, `foobar`, assert)
  await suite('complex1', {
    divider: false,
    header: false,
    name: 'foobar',
    type: 'button',
    anchorClass: 'foo',
    url: '#',
    iconClass: 'bar'
  }, `<button class="foo" href="#"><i class="bar"></i>foobar</button>`, assert)
  await suite('complex1', {
    divider: false,
    header: false,
    name: 'foobar',
    type: false,
    anchorClass: 'foo',
    url: '#',
    iconClass: 'bar'
  }, `<a class="foo" href="#"><i class="bar"></i>foobar</a>`, assert)
  console.timeEnd('conditions (files)')
})

async function suite (name, data, expected, assert) {
  const dir = join(__dirname, '../fixtures/conditions')
  const file1 = join(dir, name, 'actual.html')
  const content1 = readFileSync(file1, 'utf8')
  const template = await compile(content1)
  const actual = template(data, html => html)
  assert.deepEqual(actual.trim(), expected.trim())
}
