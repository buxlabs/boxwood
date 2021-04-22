const test = require('ava')
const AbstractSyntaxTree = require('abstract-syntax-tree')
const { unique } = require('pure-utilities/array')
const { markNodes, findParams } = require('./expression')
const lexer = require('../utilities/lexer')

function findParamsInSource (source) {
  const tokens = lexer(source)
  return tokens.reduce((result, token) => {
    if (token.type === 'expression') {
      const tree = new AbstractSyntaxTree(token.value)
      const { expression } = tree.first('ExpressionStatement')
      markNodes(expression)
      return unique([...result, ...findParams(expression)])
    }
    return result
  }, [])
}

test('findParams: works for a single param', assert => {
  const params = findParamsInSource(`{foo}`)
  assert.deepEqual(params, ['foo'])
})

test('findParams: makes for a params unique', assert => {
  const params = findParamsInSource(`{foo} {foo}`)
  assert.deepEqual(params, ['foo'])
})

test('findParams: works for multiple params', assert => {
  const params = findParamsInSource(`{foo} {bar}`)
  assert.deepEqual(params, ['foo', 'bar'])
})

test('findParams: works for member expressions', assert => {
  const params = findParamsInSource(`{foo.bar}`)
  assert.deepEqual(params, ['foo'])
})

test('findParams: works for computed member expressions', assert => {
  const params = findParamsInSource(`{foo[bar]}`)
  assert.deepEqual(params, ['foo', 'bar'])
})

test('findParams: works for nested computed member expressions', assert => {
  const params = findParamsInSource(`{foo[bar][baz]}`)
  assert.deepEqual(params, ['foo', 'bar', 'baz'])
})

test('findParams: works for a member expression with call expression as the object', assert => {
  const params = findParamsInSource(`{foo().bar}`)
  assert.deepEqual(params, ['foo'])
})

test('findParams: works for a member expression with call expression as the property', assert => {
  const params = findParamsInSource(`{foo.bar()}`)
  assert.deepEqual(params, ['foo'])
})

test('findParams: works for call expressions', assert => {
  const params = findParamsInSource(`{bar(baz())}`)
  assert.deepEqual(params, ['bar', 'baz'])
})

test('findParams: works for call expressions with member expressions', assert => {
  const params = findParamsInSource(`{bar(baz.qux())}`)
  assert.deepEqual(params, ['bar', 'baz'])
})

test('findParams: works for complex call expressions', assert => {
  const params = findParamsInSource(`{foo.bar(baz.qux())}`)
  assert.deepEqual(params, ['foo', 'baz'])
})

test('findParams: works for deeply nested expressions', assert => {
  const params = findParamsInSource(`{foo.bar().baz}`)
  assert.deepEqual(params, ['foo'])
})

test('findParams: works for deeply nested expressions with params', assert => {
  const params = findParamsInSource(`{foo.bar(qux, quux).baz}`)
  assert.deepEqual(params, ['foo', 'qux', 'quux'])
})

test('findParams: works for binary expressions', assert => {
  const params = findParamsInSource(`{foo + bar}`)
  assert.deepEqual(params, ['foo', 'bar'])
})

test('findParams: works for complex binary expressions', assert => {
  const params = findParamsInSource(`{foo.bar + baz.qux}`)
  assert.deepEqual(params, ['foo', 'baz'])
})

test('findParams: works for unary expressions', assert => {
  const params = findParamsInSource(`{!foo}`)
  assert.deepEqual(params, ['foo'])
})

test('findParams: works for complex unary expressions', assert => {
  const params = findParamsInSource(`{!foo.bar}`)
  assert.deepEqual(params, ['foo'])
})

test('findParams: works for update expressions', assert => {
  const params = findParamsInSource(`{++foo}`)
  assert.deepEqual(params, ['foo'])
})

test('findParams: works for nested update expressions', assert => {
  const params = findParamsInSource(`{foo.bar++}`)
  assert.deepEqual(params, ['foo'])
})

test('findParams: works for chain expressions', assert => {
  const params = findParamsInSource('{bar?.qux}')
  assert.deepEqual(params, ['bar'])
})

test('findParams: works for nested chain expressions', assert => {
  const params = findParamsInSource('{qux.baz?.bar}')
  assert.deepEqual(params, ['qux'])
})

test('findParams: works for conditional expressions', assert => {
  const params = findParamsInSource('{foo ? bar : baz}')
  assert.deepEqual(params, ['foo', 'bar', 'baz'])
})

test('findParams: works for complex conditional expressions', assert => {
  const params = findParamsInSource('{foo.bar ? baz.qux : quux?.quuux}')
  assert.deepEqual(params, ['foo', 'baz', 'quux'])
})

test('findParams: works for undefined', assert => {
  const params = findParamsInSource('{undefined}')
  assert.deepEqual(params, [])
})

test('findParams: works for null', assert => {
  const params = findParamsInSource('{null}')
  assert.deepEqual(params, [])
})

test('findParams: works for built-ins', assert => {
  const params = findParamsInSource('{Math.abs(foo)} {JSON.parse(bar)} {Number.finite(baz)} {console.log(qux)} {new Date(quux)}')
  assert.deepEqual(params, ['foo', 'bar', 'baz', 'qux', 'quux'])
})

test('findParams: works for destructuring', assert => {
  const params = findParamsInSource('{foo({ bar: baz, qux })}')
  assert.deepEqual(params, ['foo', 'baz', 'qux'])
})

test('findParams: works for logical expressions', assert => {
  const params = findParamsInSource('{foo && bar}')
  assert.deepEqual(params, ['foo', 'bar'])
})

test('findParams: works for arrays', assert => {
  const params = findParamsInSource('{[foo, bar][index]}')
  assert.deepEqual(params, ['foo', 'bar', 'index'])
})

test.skip('findParams: works for array syntax', assert => {
  const params = findParamsInSource('[foo]')
  assert.deepEqual(params, ['foo'])
})
