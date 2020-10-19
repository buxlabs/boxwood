const test = require('ava')
const { parse, first, generate } = require('abstract-syntax-tree')
const { convertTag } = require('./convert')
const { SELF_CLOSING_TAGS } = require('../../../utilities/enum')

function transform (input) {
  const tree = parse(input)
  const node = first(tree, 'CallExpression')
  const result = convertTag(node)
  return generate(result)
}

test('convertTag: html tag', assert => {
  assert.deepEqual(transform('tag("p")'), '"<p></p>"')
  assert.deepEqual(transform('tag("a")'), '"<a></a>"')
  assert.deepEqual(transform('tag("div")'), '"<div></div>"')
  assert.deepEqual(transform('tag("span")'), '"<span></span>"')
})

SELF_CLOSING_TAGS.forEach(tag => {
  test(`convertTag: self closing tag: ${tag}`, assert => {
    assert.deepEqual(transform(`tag("${tag}")`), `"<${tag} />"`)
  })
})

test('convertTag: html tag with text', assert => {
  assert.deepEqual(
    transform(`tag('p', 'Hello, world!')`),
    '"<p>Hello, world!</p>"'
  )
})

test('convertTag: html tag with an attribute', assert => {
  assert.deepEqual(
    transform(`tag('a', { href: '#foo' })`),
    `"<a href=\\"#foo\\"></a>"`
  )
})

test('convertTag: html tag with an attribute and text', assert => {
  assert.deepEqual(
    transform(`tag('a', { href: '#foo' }, 'bar')`),
    `"<a href=\\"#foo\\">bar</a>"`
  )
})

test('convertTag: html tag with template literal', assert => {
  assert.deepEqual(
    transform(`tag('a', \`bar\`)`),
    `"<a>" + \`bar\` + "</a>"`
  )
})

test('convertTag: html tag with template literal in nested child', assert => {
  assert.deepEqual(
    transform(`tag('a', [
        tag('span', \`bar\`)
      ])`
    ),
    `"<a>" + ("<span>" + \`bar\` + "</span>") + "</a>"`
  )
})

test('convertTag: html page', assert => {
  assert.deepEqual(
    transform(`
      tag('html', [
        tag('head', [
          tag('title', 'foo')
        ]),
        tag('body', [
          tag('button', \`bar\`)
        ])
      ])
    `),
    `"<html>" + ("<head><title>foo</title></head>" + ("<body>" + ("<button>" + \`bar\` + "</button>") + "</body>")) + "</html>"`
  )
})
