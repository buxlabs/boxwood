const AbstractSyntaxTree = require('abstract-syntax-tree')
const { Identifier } = AbstractSyntaxTree

let FOR_LOOP_INDEX = 0

function mapForStatement (htmlNode, parent, index, transpileNode) {
  FOR_LOOP_INDEX++
  const [node] = AbstractSyntaxTree.template(`
    (function () {
      var __output__ = [];
      for (var <%= index %> = 0, <%= length %> = <%= array %>.length; <%= index %> < <%= length %>; <%= index %>++) {
        var <%= item %> = <%= array %>[<%= index %>];
        __output__.push(%= children %);
      }
      return __output__;
    })();
  `, {
    index: new Identifier(`__i${FOR_LOOP_INDEX}__`),
    length: new Identifier(`__ilen${FOR_LOOP_INDEX}__`),
    item: new Identifier(htmlNode.attributes[0].key),
    // TODO we should not mark params which were created on the fly, e.g. for nested loops
    array: new Identifier({ name: htmlNode.attributes[2].key, parameter: true }),
    children: htmlNode.children.map((child, index) =>
      transpileNode({ node: child, parent: htmlNode, index })
    )
  })
  return node.expression
}

module.exports = mapForStatement
