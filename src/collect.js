const AbstractSyntaxTree = require('@buxlabs/ast')
const { array } = require('@buxlabs/utils')
const {
  getLiteral,
  getTemplateAssignmentExpression,
  getObjectMemberExpression,
  getForLoop,
  getForLoopVariable
} = require('./factory')
const { convertHtmlOrTextAttribute, getNodes } = require('./convert')
const walk = require('./walk')

function getLoopIndex (variables) {
  return array.identifier(variables)
}

function getLoopGuard (variables) {
  return array.identifier(variables)
}

function collect (start, end, fragment, variables = []) {
  if (fragment.used) return
  fragment.used = true
  const node = fragment.nodeName
  const { attrs } = fragment
  if (node === '#text') {
    return start.append(getTemplateAssignmentExpression(getLiteral(fragment.value)))
  } else if (node === 'if') {
    const header = new AbstractSyntaxTree('')
    const footer = new AbstractSyntaxTree('')
    walk(fragment, current => {
      collect(header, footer, current, variables)
    })
    start.append({
      type: 'IfStatement',
      test: getObjectMemberExpression(attrs[0].name),
      consequent: {
        type: 'BlockStatement',
        body: header.ast.body.concat(footer.ast.body)
      }
    })
  } else if (node === 'elseif') {
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
        type: 'IfStatement',
        test: getObjectMemberExpression(attrs[0].name),
        consequent: {
          type: 'BlockStatement',
          body: header.ast.body.concat(footer.ast.body)
        }
      }
    }
  } else if (node === 'else') {
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
  } else if (node === 'loop') {
    const loop = attrs.find(attr => attr.name === 'for') 
    const header = new AbstractSyntaxTree('')
    const footer = new AbstractSyntaxTree('')
    const [variable, parent] = loop.value.split(' in ')
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
    if (node !== 'if' && node !== 'else' && node !== 'elseif' && node !== 'loop' && node !== 'slot') {
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

module.exports = collect