const { readFileSync } = require('fs')
const { join } = require('path')
const { equal } = require('assert')
const { compile } = require('..')

function test (name, data = {}) {
  const dir = join(__dirname, 'fixtures/examples')
  const file1 = join(dir, name, 'actual.html')
  const file2 = join(dir, name, 'expected.html')
  const content1 = readFileSync(file1, 'utf8')
  const template = compile(content1)
  const actual = template(data, html => html)
  const expected = readFileSync(file2, 'utf8')
  equal(actual, expected)
}

// test('fizzbuzz')
// test('simple')
// test('footer')
