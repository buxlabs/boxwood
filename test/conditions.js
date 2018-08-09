const { readFileSync } = require('fs')
const { join } = require('path')
const { equal } = require('assert')
const compile = require('./helpers/compile')

function test (name, data = {}, expected) {
  const dir = join(__dirname, 'fixtures/conditions')
  const file1 = join(dir, name, 'actual.html')
  const content1 = readFileSync(file1, 'utf8')
  const template = compile(content1)
  const actual = template(data, html => html)
  equal(actual.trim(), expected.trim())
}

console.time('conditions')

test('complex1', {
  divider: true
}, `<div class="divider"></div>`)

test('complex1', {
  divider: undefined,
  header: true,
  name: 'foobar'
}, `foobar`)

test('complex1', {
  divider: false,
  header: false,
  name: 'foobar',
  type: 'button',
  anchorClass: 'foo',
  url: '#',
  iconClass: 'bar'
}, `<button class="foo" href="#"><i class="bar"></i>foobar</button>`)

test('complex1', {
  divider: false,
  header: false,
  name: 'foobar',
  type: false,
  anchorClass: 'foo',
  url: '#',
  iconClass: 'bar'
}, `<a class="foo" href="#"><i class="bar"></i>foobar</a>`)


console.timeEnd('conditions')
