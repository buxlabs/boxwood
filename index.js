const { parseFragment } = require('parse5')
const AbstractSyntaxTree = require('@buxlabs/ast')
const { OBJECT_VARIABLE, ESCAPE_VARIABLE } = require('./src/enum')
const walk = require('./src/walk')
const {
  getLiteral,
  getTemplateVariableDeclaration,
  getTemplateAssignmentExpression,
  getTemplateReturnStatement,
  getForLoop,
  getForLoopVariable
} = require('./src/factory')
const { convertHtmlOrTextAttribute, getNodes } = require('./src/convert')

function collect (start, end, fragment, variables = []) {
  if (fragment.used) return
  fragment.used = true
  const node = fragment.nodeName
  const { attrs } = fragment
  if (node === '#text') {
    return start.append(getTemplateAssignmentExpression(getLiteral(fragment.value)))
  } else if (node === 'slot' && attrs) {
    const repeat = attrs.find(attr => attr.name === 'repeat.for') 
    if (repeat) {
      const header = new AbstractSyntaxTree('')
      const footer = new AbstractSyntaxTree('')
      let variable
      let parent = repeat.value
      if (repeat.value.includes(' in ')) {
        [variable, parent] = repeat.value.split(' in ')
        variables = variables.concat(variable)
        header.append(getForLoopVariable(variable, parent))
      }
      walk(fragment, current => {
        collect(header, footer, current, variables)
      })
      start.append(getForLoop(parent, header.ast.body.concat(footer.ast.body)))
    } else {
      const leaf = convertHtmlOrTextAttribute(node, attrs)
      if (leaf) {
        start.append(getTemplateAssignmentExpression(leaf))
      }
    }
  } else if (attrs) {
    const nodes = getNodes(node, attrs, variables)
    nodes.forEach(node => start.append(node))
  }
  if (fragment.__location && fragment.__location.endTag) {
    if (node !== 'slot') {
      end.append(getTemplateAssignmentExpression(getLiteral(`</${node}>`)))
    }
  }
}

module.exports = {
  render () {},
  compile (source) {
    const tree = parseFragment(source, { locationInfo: true })
    const start = new AbstractSyntaxTree('')
    const end = new AbstractSyntaxTree('')
    start.append(getTemplateVariableDeclaration())
    walk(tree, fragment => {
      collect(start, end, fragment)
    })
    end.append(getTemplateReturnStatement())
    const body = start.toString() + end.toString()
    return new Function(OBJECT_VARIABLE, ESCAPE_VARIABLE, body) // eslint-disable-line
  }
}
