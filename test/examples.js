const { readFileSync } = require('fs')
const { join } = require('path')
const { equal } = require('assert')
const { compile } = require('..')

function test (name, data = {}) {
  const fixture = join(__dirname, 'fixtures', name, 'input.html')
  const template = readFileSync(fixture, 'utf8')
  const fn = compile(template)
  return compile(data, html => html)
}

// test('ad')
// test('simple')
// test('footer')
