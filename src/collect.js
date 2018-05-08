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
const { convertHtmlOrTextAttribute, convertText, convertTag, convertAttribute } = require('./convert')
const { walk } = require('./parser')
const { SPECIAL_TAGS, SELF_CLOSING_TAGS, OPERATORS_MAP, BITWISE_OPERATORS_MAP } = require('./enum')
const { getAction } = require('./action')

function getFreeIdentifier (variables) {
  return array.identifier(variables)
}

function getTemplateIdentifier (prefix, key, variables) {
  return variables.includes(prefix) ? getIdentifier(key) : getObjectMemberExpression(key)
}

function collect (tree, fragment, variables, modifiers) {
  if (fragment.used) return
  fragment.used = true
  const tag = fragment.tagName
  const attrs = fragment.attributes
  if (fragment.type === 'element' && !SPECIAL_TAGS.includes(tag)) {
    const nodes = convertTag(fragment, variables, modifiers)
    nodes.forEach(node => {
      if (node.type === 'IfStatement') {
        return tree.append(node)
      }
      tree.append(getTemplateAssignmentExpression(node))
    })
    fragment.children.forEach(node => {
      collect(tree, node, variables, modifiers)
    })
    if (!SELF_CLOSING_TAGS.includes(tag)) {
      const attr = fragment.attributes.find(attr => attr.key === 'tag' || attr.key === 'tag.bind')
      if (attr) {
        const property = attr.key === 'tag' ? attr.value.substring(1, attr.value.length - 1) : attr.value
        tree.append(getTemplateAssignmentExpression(getLiteral('</')))
        tree.append(getTemplateAssignmentExpression(getObjectMemberExpression(property)))
        tree.append(getTemplateAssignmentExpression(getLiteral('>')))
      } else {
        tree.append(getTemplateAssignmentExpression(getLiteral(`</${tag}>`)))
      }
    }
  } else if (fragment.type === 'text') {
    const nodes = convertText(fragment.content, variables, modifiers)
    return nodes.forEach(node => tree.append(getTemplateAssignmentExpression(node)))
  } else if (tag === 'if') {
    const ast = new AbstractSyntaxTree('')
    walk(fragment, current => {
      collect(ast, current, variables, modifiers)
    })
    const appendIfStatement = node => {
      tree.append({
        type: 'IfStatement',
        test: node,
        consequent: {
          type: 'BlockStatement',
          body: ast.body()
        }
      })
    }
    const findAction = (keys, index) => {
      const keywords = []
      let action

      for (let i = 1; i < keys.length; i++) {
        keywords.push(keys[i])
        action = getAction(keywords)

        if (action) return action
      }
    }
    const getTest = (action, keys) => {
      if (!action || action.args === 1) {
        const key = keys[0]
        const [prefix] = key.split('.')
        const node = getTemplateIdentifier(prefix, key, variables)

        if (!action) return node
        return action.handler(node)
      }
      if (action.args === 2) {
        let left
        let right
        let test

        for (let i = 0; i < keys.length; i++) {
          if (left) {
            let condition = keys[i]
            let prefix = condition.split('.')

            right = getTemplateIdentifier(prefix, condition, variables)
            test = action.handler(left, right)
            continue
          }

          const condition1 = keys[i]
          const [prefix1] = condition1.split('.')
          left = getTemplateIdentifier(prefix1, condition1, variables)

          i += action.name.length //skip operator

          const condition2 = keys[++i]
          const [prefix2] = condition2.split('.')
          right = getTemplateIdentifier(prefix2, condition2, variables)

          test = action.handler(left, right)
        }
        return test
      }
    }
    const keys = attrs.map(attr => attr.key)
    const action = findAction(keys)
    const test = getTest(action, keys)
    appendIfStatement(test)
  } else if (tag === 'elseif') {
    let leaf = tree.last('IfStatement')
    if (leaf) {
      const ast = new AbstractSyntaxTree('')
      walk(fragment, current => {
        collect(ast, current, variables, modifiers)
      })
      while (leaf.alternate && leaf.alternate.type === 'IfStatement') {
        leaf = leaf.alternate
      }
      const { key } = attrs[0]
      const [prefix] = key.split('.')
      leaf.alternate = {
        type: 'IfStatement',
        test: getTemplateIdentifier(prefix, key, variables),
        consequent: {
          type: 'BlockStatement',
          body: ast.body()
        }
      }
    }
  } else if (tag === 'else') {
    let leaf = tree.last('IfStatement')
    if (leaf) {
      const ast = new AbstractSyntaxTree('')
      walk(fragment, current => {
        collect(ast, current, variables, modifiers)
      })
      while (leaf.alternate && leaf.alternate.type === 'IfStatement') {
        leaf = leaf.alternate
      }
      leaf.alternate = {
        type: 'BlockStatement',
        body: ast.body()
      }
    }
  } else if (tag === 'each' || tag === 'for') {
    const ast = new AbstractSyntaxTree('')
    const [left, operator, right] = attrs
    const variable = left.key
    let parent = operator.value || `{${right.key}}`
    const name = convertAttribute('html', parent, variables)

    variables.push(variable)
    parent = parent.substring(1, parent.length - 1) // TODO: Handle nested properties
    const index = getFreeIdentifier(variables.concat(parent))
    variables.push(index)
    const guard = getFreeIdentifier(variables.concat(parent))
    variables.push(guard)
    ast.append(getForLoopVariable(variable, name, variables, index))
    walk(fragment, current => {
      collect(ast, current, variables, modifiers)
    })
    tree.append(getForLoop(name, ast.body(), variables, index, guard))
    variables.pop()
    variables.pop()
    variables.pop()
  } else if (tag === 'slot' && attrs && attrs.length > 0) {
    const leaf = convertHtmlOrTextAttribute(fragment, variables)
    if (leaf) {
      tree.append(getTemplateAssignmentExpression(leaf))
    }
  } else if (tag === 'try') {
    const ast = new AbstractSyntaxTree('')
    walk(fragment, current => {
      collect(ast, current, variables, modifiers)
    })

    tree.append({
      type: 'TryStatement',
      block: {
        type: 'BlockStatement',
        body: ast.body()
      }
    })
  } else if (tag === 'catch') {
    const leaf = tree.last('TryStatement')
    if (leaf) {
      const ast = new AbstractSyntaxTree('')
      walk(fragment, current => {
        collect(ast, current, variables, modifiers)
      })
      leaf.handler = {
        type: 'CatchClause',
        param: {
          type: 'Identifier',
          name: 'exception'
        },
        body: {
          type: 'BlockStatement',
          body: ast.body()
        }
      }
    }
  } else if (tag === 'unless') {
    const ast = new AbstractSyntaxTree('')
    walk(fragment, current => {
      collect(ast, current, variables, modifiers)
    })
    const { key } = attrs[0]
    const [prefix] = key.split('.')

    tree.append({
      type: 'IfStatement',
      test: {
        type: 'UnaryExpression',
        operator: '!',
        argument: getTemplateIdentifier(prefix, key, variables)
      },
      consequent: {
        type: 'BlockStatement',
        body: ast.body()
      }
    })
  } else if (tag === 'elseunless') {
    let leaf = tree.last('IfStatement')
    if (leaf) {
      const ast = new AbstractSyntaxTree('')
      walk(fragment, current => {
        collect(ast, current, variables, modifiers)
      })
      while (leaf.alternate && leaf.alternate.type === 'IfStatement') {
        leaf = leaf.alternate
      }
      const { key } = attrs[0]
      const [prefix] = key.split('.')
      leaf.alternate = {
        type: 'IfStatement',
        test: {
          type: 'UnaryExpression',
          operator: '!',
          argument: getTemplateIdentifier(prefix, key, variables)
        },
        consequent: {
          type: 'BlockStatement',
          body: ast.body()
        }
      }
    }
  }
}

module.exports = collect
