const { parseFragment } = require('parse5')
const AbstractSyntaxTree = require('@buxlabs/ast')
const { array } = require('@buxlabs/utils')
const { OBJECT_VARIABLE, ESCAPE_VARIABLE } = require('./src/enum')
const walk = require('./src/walk')
const {
  getLiteral,
  getTemplateVariableDeclaration,
  getTemplateAssignmentExpression,
  getTemplateReturnStatement,
  getObjectMemberExpression,
  getForLoop,
  getForLoopVariable
} = require('./src/factory')
const { convertHtmlOrTextAttribute, getNodes } = require('./src/convert')

function getLoopIndex (variables) {
  return array.identifier(variables)
}

function getLoopGuard (index) {
  return index + 'len'
}

function collect (start, end, fragment, variables = []) {
  if (fragment.used) return
  fragment.used = true
  const node = fragment.nodeName
  const { attrs } = fragment
  if (node === '#text') {
    return start.append(getTemplateAssignmentExpression(getLiteral(fragment.value)))
  } else if (node === 'loop') {
    const loop = attrs.find(attr => attr.name === 'for') 
    const header = new AbstractSyntaxTree('')
    const footer = new AbstractSyntaxTree('')
    const [variable, parent] = loop.value.split(' in ')
    variables.push(variable)
    const index = getLoopIndex(variables)
    const guard = getLoopGuard(index)
    variables.push(index)
    header.append(getForLoopVariable(variable, parent, variables, index))
    walk(fragment, current => {
      collect(header, footer, current, variables)
    })
    start.append(getForLoop(parent, header.ast.body.concat(footer.ast.body), variables, index, guard))
  } else if (node === 'slot' && attrs) {
    const leaf = convertHtmlOrTextAttribute(node, attrs)
    if (leaf) {
      start.append(getTemplateAssignmentExpression(leaf))
    }
  } else if (attrs) {
    const nodes = getNodes(node, attrs, variables)
    nodes.forEach(node => start.append(node))
  }
  if (fragment.__location && fragment.__location.endTag) {
    if (node !== 'slot' && node !== 'loop') {
      const tag = attrs.find(attr => attr.name === 'tag' || attr.name === 'tag.bind')
      if (tag) {
        const property = tag.name === 'tag' ? tag.value.substring(1, tag.value.length - 1) : tag.value
        end.append(getTemplateAssignmentExpression(getLiteral('</')))
        end.append(getTemplateAssignmentExpression(getObjectMemberExpression(property)))
        end.append(getTemplateAssignmentExpression(getLiteral('>')))
      } else {
        end.append(getTemplateAssignmentExpression(getLiteral(`</${node}>`)))
      }
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
