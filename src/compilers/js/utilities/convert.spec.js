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

test('convertTag: html tags', assert => {
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
