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

function getLoopIndex (variables) {
  return array.identifier(variables)
}

function getLoopGuard (variables) {
  return array.identifier(variables)
}

function collect (start, end, fragment, variables) {
  if (fragment.used) return
  fragment.used = true
  const tag = fragment.tagName
  const { attrs } = fragment
  if (fragment.type === 'text') {
    const nodes = convertText(fragment.value, variables)
    return nodes.forEach(node => start.append(node))
  } else if (tag === 'if') {
    const header = new AbstractSyntaxTree('')
    const footer = new AbstractSyntaxTree('')
    walk(fragment, current => {
      collect(header, footer, current, variables)
    })
    const { name } = attrs[0]
    const [prefix] = name.split('.')
    start.append({
      type: 'IfStatement',
      test: variables.includes(prefix) ? getIdentifier(name) : getObjectMemberExpression(name),
      consequent: {
        type: 'BlockStatement',
        body: header.ast.body.concat(footer.ast.body)
      }
    })
  } else if (tag === 'elseif') {
    let leaf = start.ast.body[start.ast.body.length - 1]
    if (leaf.type === 'IfStatement') {
      const header = new AbstractSyntaxTree('')
      const footer = new AbstractSyntaxTree('')
      walk(fragment, current => {
        collect(header, footer, current, variables)
      })
      while (leaf.alternate && leaf.alternate.type === 'IfStatement') {
        leaf = leaf.alternate
      }
      const { name } = attrs[0]
      const [prefix] = name.split('.')
      leaf.alternate = {
        type: 'IfStatement',
        test: variables.includes(prefix) ? getIdentifier(name) : getObjectMemberExpression(name),
        consequent: {
          type: 'BlockStatement',
          body: header.ast.body.concat(footer.ast.body)
        }
      }
    }
  } else if (tag === 'else') {
    let leaf = start.ast.body[start.ast.body.length - 1]
    if (leaf.type === 'IfStatement') {
      const header = new AbstractSyntaxTree('')
      const footer = new AbstractSyntaxTree('')
      walk(fragment, current => {
        collect(header, footer, current, variables)
      })
      while (leaf.alternate && leaf.alternate.type === 'IfStatement') {
        leaf = leaf.alternate
      }
      leaf.alternate = {
        type: 'BlockStatement',
        body: header.ast.body.concat(footer.ast.body)
      }
    }
  } else if (tag === 'each' || tag === 'for') {
    const header = new AbstractSyntaxTree('')
    const footer = new AbstractSyntaxTree('')
    const [variable, , parent] = attrs.map(attr => attr.name)
    variables.push(variable)
    const index = getLoopIndex(variables.concat(parent))
    variables.push(index)
    const guard = getLoopGuard(variables.concat(parent))
    variables.push(guard)
    header.append(getForLoopVariable(variable, parent, variables, index))
    walk(fragment, current => {
      collect(header, footer, current, variables)
    })
    start.append(getForLoop(parent, header.ast.body.concat(footer.ast.body), variables, index, guard))
  } else if (tag === 'slot' && attrs) {
    const leaf = convertHtmlOrTextAttribute(fragment, variables)
    if (leaf) {
      start.append(getTemplateAssignmentExpression(leaf))
    }
  } else if (attrs) {
    const nodes = getNodes(fragment, variables)
    nodes.forEach(node => start.append(node))
  }
  if (fragment.__location && fragment.__location.endTag) {
    if (tag !== 'if' && tag !== 'else' && tag !== 'elseif' && tag !== 'each' && tag !== 'for' && tag !== 'slot') {
      const attr = attrs.find(attr => attr.name === 'tag' || attr.name === 'tag.bind')
      if (attr) {
        const property = attr.name === 'tag' ? attr.value.substring(1, attr.value.length - 1) : attr.value
        end.append(getTemplateAssignmentExpression(getLiteral('</')))
        end.append(getTemplateAssignmentExpression(getObjectMemberExpression(property)))
        end.append(getTemplateAssignmentExpression(getLiteral('>')))
      } else {
        end.append(getTemplateAssignmentExpression(getLiteral(`</${tag}>`)))
      }
    }
  }
}

module.exports = collect
