const AbstractSyntaxTree = require('@buxlabs/ast')
const { array } = require('@buxlabs/utils')
const {
  getIdentifier,
  getLiteral,
  getTemplateAssignmentExpression,
  getObjectMemberExpression,
  getForLoop,
  getForLoopVariable
} = require('./factory')
const { convertHtmlOrTextAttribute, convertText, getNodes } = require('./convert')
const { walk } = require('./parser')
const { SPECIAL_TAGS, SELF_CLOSING_TAGS } = require('./enum')

function getLoopIndex (variables) {
  return array.identifier(variables)
}

function getLoopGuard (variables) {
  return array.identifier(variables)
}

function collect (ast, fragment, variables) {
  if (fragment.used) return
  fragment.used = true
  const tag = fragment.tagName
  const attrs = fragment.attributes
  if (fragment.type === 'element' && !SPECIAL_TAGS.includes(tag)) {
    const nodes = getNodes(fragment, variables)
    nodes.forEach(node => ast.append(node))
    fragment.children.forEach(node => {
      collect(ast, node, variables)
    })
    if (!SELF_CLOSING_TAGS.includes(tag)) {
      const attr = fragment.attributes.find(attr => attr.key === 'tag' || attr.key === 'tag.bind')
      if (attr) {
        const property = attr.key === 'tag' ? attr.value.substring(1, attr.value.length - 1) : attr.value
        ast.append(getTemplateAssignmentExpression(getLiteral('</')))
        ast.append(getTemplateAssignmentExpression(getObjectMemberExpression(property)))
        ast.append(getTemplateAssignmentExpression(getLiteral('>')))
      } else {
        ast.append(getTemplateAssignmentExpression(getLiteral(`</${tag}>`)))
      }
    }
  } else if (fragment.type === 'text') {
    const nodes = convertText(fragment.content, variables)
    return nodes.forEach(node => ast.append(node))
  } else if (tag === 'if') {
    const header = new AbstractSyntaxTree('')
    walk(fragment, current => {
      collect(header, current, variables)
    })
    const { key } = attrs[0]
    const [prefix] = key.split('.')
    ast.append({
      type: 'IfStatement',
      test: variables.includes(prefix) ? getIdentifier(key) : getObjectMemberExpression(key),
      consequent: {
        type: 'BlockStatement',
        body: header.ast.body
      }
    })
  } else if (tag === 'elseif') {
    let leaf = ast.ast.body[ast.ast.body.length - 1]
    if (leaf.type === 'IfStatement') {
      const header = new AbstractSyntaxTree('')
      walk(fragment, current => {
        collect(header, current, variables)
      })
      while (leaf.alternate && leaf.alternate.type === 'IfStatement') {
        leaf = leaf.alternate
      }
      const { key } = attrs[0]
      const [prefix] = key.split('.')
      leaf.alternate = {
        type: 'IfStatement',
        test: variables.includes(prefix) ? getIdentifier(key) : getObjectMemberExpression(key),
        consequent: {
          type: 'BlockStatement',
          body: header.ast.body
        }
      }
    }
  } else if (tag === 'else') {
    let leaf = ast.ast.body[ast.ast.body.length - 1]
    if (leaf.type === 'IfStatement') {
      const header = new AbstractSyntaxTree('')
      walk(fragment, current => {
        collect(header, current, variables)
      })
      while (leaf.alternate && leaf.alternate.type === 'IfStatement') {
        leaf = leaf.alternate
      }
      leaf.alternate = {
        type: 'BlockStatement',
        body: header.ast.body
      }
    }
  } else if (tag === 'each' || tag === 'for') {
    const header = new AbstractSyntaxTree('')
    const [variable, , parent] = attrs.map(attr => attr.key)
    variables.push(variable)
    const index = getLoopIndex(variables.concat(parent))
    variables.push(index)
    const guard = getLoopGuard(variables.concat(parent))
    variables.push(guard)
    header.append(getForLoopVariable(variable, parent, variables, index))
    walk(fragment, current => {
      collect(header, current, variables)
    })
    ast.append(getForLoop(parent, header.ast.body, variables, index, guard))
  } else if (tag === 'slot' && attrs && attrs.length > 0) {
    const leaf = convertHtmlOrTextAttribute(fragment, variables)
    if (leaf) {
      ast.append(getTemplateAssignmentExpression(leaf))
    }
  }
}

module.exports = collect
