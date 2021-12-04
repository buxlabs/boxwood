const test = require('ava')
const mapIfStatement = require('./if')
const { parse } = require('../../../utilities/html')
const { generate } = require('abstract-syntax-tree')
const { transpileNode } = require('../node')

const transpile = (html) => {
  const htmlTree = parse(html)
  const jsTree = mapIfStatement(htmlTree[0], htmlTree, 0, transpileNode)
  return generate(jsTree).replace(/\s+/g, ' ')
}

test('transpiles `if` with true as a string', assert => {
  assert.deepEqual(
    transpile('<if true></if>'),
    'if (true) { return ""; } else { return ""; }'
  )
})

test('transpiles `if` with true as an expression', assert => {
  assert.deepEqual(
    transpile('<if {true}></if>'),
    'if (true) { return ""; } else { return ""; }'
  )
})

test('transpiles `if` with false as a string', assert => {
  assert.deepEqual(
    transpile('<if false></if>'),
    'if (false) { return ""; } else { return ""; }'
  )
})

test('transpiles `if` with false as an expression', assert => {
  assert.deepEqual(
    transpile('<if {false}></if>'),
    'if (false) { return ""; } else { return ""; }'
  )
})

test('transpiles `if` with a simple expression', assert => {
  assert.deepEqual(
    transpile('<if foo></if>'),
    'if (foo) { return ""; } else { return ""; }'
  )
})
