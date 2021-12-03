const AbstractSyntaxTree = require('abstract-syntax-tree')

const { ReturnStatement, BlockStatement, TryStatement, CatchClause } = AbstractSyntaxTree

function mapTryStatement (htmlNode, parent, index, transpileNode) {
  function mapCurrentNodeToBlockStatement (htmlNode) {
    const body = htmlNode.children.map((node, index) => transpileNode({ node, parent: htmlNode.children, index })).filter(Boolean)
    const argument = body.pop()
    body.push(new ReturnStatement({ argument }))
    return new BlockStatement({ body })
  }

  function mapNextNodeToCatchClause (nextNode) {
    if (nextNode && nextNode.tagName === 'catch') {
      const body = nextNode.children.map((node, index) => transpileNode({ node, parent: htmlNode.children, index })).filter(Boolean)
      const argument = body.pop()
      body.push(new ReturnStatement({ argument }))
      return new CatchClause({
        body: new BlockStatement({ body })
      })
    }
    return null
  }
  return new TryStatement({
    block: mapCurrentNodeToBlockStatement(htmlNode),
    handler: mapNextNodeToCatchClause(parent[index + 1])
  })
}

module.exports = mapTryStatement
