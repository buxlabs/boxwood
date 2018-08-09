const { readFileSync } = require('fs')
const { join } = require('path')
const { equal } = require('assert')
const compile = require('./helpers/compile')

function normalize (string) {
  return string.replace(/\s+/g, '')
}

function test (name, data = {}) {
  const dir = join(__dirname, 'fixtures/examples')
  const file1 = join(dir, name, 'actual.html')
  const file2 = join(dir, name, 'expected.html')
  const content1 = readFileSync(file1, 'utf8')
  const template = compile(content1)
  const actual = normalize(template(data, html => html))
  const expected = normalize(readFileSync(file2, 'utf8'))
  equal(actual, expected)
}
console.time('examples')

test('fizzbuzz')
test('grid', {
  collection: {
    each: function (callback) {
      const elements = [1, 2, 3, 4]
      elements.forEach(callback)
    }
  }
})
console.timeEnd('examples')
