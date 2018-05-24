const AbstractSyntaxTree = require('abstract-syntax-tree')
const { array } = require('pure-utilities')
const {
  getIdentifier,
  getLiteral,
  getTemplateAssignmentExpression,
  getObjectMemberExpression,
  getForLoop,
  getForLoopVariable
} = require('./factory')
const { convertHtmlOrTextAttribute, convertText, convertTag, convertAttribute, convertToExpression, convertToBinaryExpression } = require('./convert')
const { walk } = require('./parser')
const { SPECIAL_TAGS, SELF_CLOSING_TAGS, OPERATORS_MAP, BITWISE_OPERATORS_MAP } = require('./enum')
const { getAction } = require('./action')
const { readFileSync, existsSync } = require('fs')
const { join } = require('path')
const { parse } = require('himalaya')
const { normalize } = require('./array')

function getFreeIdentifier (variables) {
  return array.identifier(variables)
}

function getIdentifierWithOptionalPrefix (prefix, key, variables) {
  return variables.includes(prefix) ? getIdentifier(key) : getObjectMemberExpression(key)
}

function findActions (attributes) {
  return attributes
    .filter(attr => attr.type === 'Action')
    .map(attr => getAction(attr.key))
}

function collectComponentsFromImport (fragment, components, options) {
  const attrs = fragment.attributes
  const name = attrs[0].key
  const path = attrs[1].value
  for (let i = 0, ilen = options.paths.length; i < ilen; i += 1) {
    const location = join(options.paths[i], path)
    if (!existsSync(location)) continue
    const content = readFileSync(location, 'utf8')
    components.push({ name, content })
    const htmlTree = parse(content)
    break
  }
}

function collectComponentsFromPartialOrRender (fragment, options) {
  const path = fragment.attributes[0].value
  for (let i = 0, ilen = options.paths.length; i < ilen; i += 1) {
    const location = join(options.paths[i], path)
    if (!existsSync(location)) continue
    const content = readFileSync(location, 'utf8')
    fragment.children = parse(content)
    break
  }
}

function collectComponentsFromPartialAttribute (fragment, options) {
  const attr = fragment.attributes.find(attr => attr.key === 'partial')
  if (attr) {
    const path = attr.value
    for (let i = 0, ilen = options.paths.length; i < ilen; i += 1) {
      const location = join(options.paths[i], path)
      if (!existsSync(location)) continue
      const content = readFileSync(location, 'utf8')
      fragment.attributes = fragment.attributes.filter(attr => attr.key !== 'partial')
      fragment.children = parse(content)
      break
    }
  }
}

function convertValueToNode (value, variables) {
  if (value.includes('{') && value.includes('}')) {
    value = value.replace(/{|}/g, '')
    const expression = convertToExpression(value)
    if (expression.type === 'Identifier') {
      const [prefix] = value.split('.')
      return getIdentifierWithOptionalPrefix(prefix, value, variables)
    } else if (expression.type === 'Literal') {
      return getLiteral(expression.value)
    } else if (expression.type === 'BinaryExpression') {
      const nodes = [expression.left, expression.right]
      return convertToBinaryExpression(nodes)
    }
  }
  return getLiteral(value)
}

function collect (tree, fragment, variables, modifiers, components, options) {
  if (fragment.used) return
  fragment.used = true
  const tag = fragment.tagName
  const attrs = fragment.attributes
  const component = components.find(component => component.name === tag)
  if (component && !fragment.plain) {
    function resolveComponent (component, fragment, variables, modifiers, components, options) {
      const htmlTree = parse(component.content)
      const children = fragment.children
      const currentComponents = []

      walk(htmlTree, current => {
        if (current.type === 'element' && current.tagName === 'slot') {
          current.children = children
        }
        if (current.tagName === 'import') {
          collectComponentsFromImport(current, currentComponents, options)
        } else if (current.tagName === 'partial' || current.tagName === 'render') {
          collectComponentsFromPartialOrRender(current, options)
        } else if (current.attributes && current.attributes[0] && current.attributes[0].key === 'partial') {
          collectComponentsFromPartialAttribute(current, options)
        }
        const component = currentComponents.find(component => component.name === current.tagName)
        if (component && !current.plain) {
          resolveComponent(component, current, variables, modifiers, currentComponents, options)
          current.used = true
        }
        current.plain = true
      })
      fragment.children = htmlTree
    }
    resolveComponent(component, fragment, variables, modifiers, components, options)
    const ast = new AbstractSyntaxTree('')
    walk(fragment, current => {
      collect(ast, current, variables, modifiers, components, options)
    })
    const body = ast.body()
    body.forEach(node => tree.append(node))
  } else if (tag === 'script' && attrs[0] && attrs[0].key === 'inline') {
    const leaf = fragment.children[0]
    leaf.used = true
    const ast = new AbstractSyntaxTree(leaf.content)
    ast.each('VariableDeclarator', node => variables.push(node.id.name))
    const body = ast.body()
    body.forEach(node => tree.append(node))
  } else if (fragment.type === 'element' && !SPECIAL_TAGS.includes(tag)) {
    collectComponentsFromPartialAttribute(fragment, options)
    const nodes = convertTag(fragment, variables, modifiers)
    nodes.forEach(node => {
      if (node.type === 'IfStatement') {
        return tree.append(node)
      }
      tree.append(getTemplateAssignmentExpression(node))
    })
    fragment.children.forEach(node => {
      collect(tree, node, variables, modifiers, components, options)
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
      collect(ast, current, variables, modifiers, components, options)
    })
    function appendIfStatement (node) {
      tree.append({
        type: 'IfStatement',
        test: node,
        consequent: {
          type: 'BlockStatement',
          body: ast.body()
        }
      })
    }
    function getTest (action, keys, values) {
      if (action.args === 1) {
        let key = keys[0]
        if (keys[0] === 'not') {
          key = keys[1]
        }
        const [prefix] = key.split('.')
        const node = getIdentifierWithOptionalPrefix(prefix, key, variables)
        return action.handler(node)
      } else if (action.args === 2) {
        const condition1 = keys[0]
        const [prefix1] = condition1.split('.')
        let left = getIdentifierWithOptionalPrefix(prefix1, condition1, variables)
        let right
        let value = values[1]
        if (value) {
          right = convertValueToNode(value, variables)
        } else {
          const condition2 = keys[2]
          const [prefix2] = condition2.split('.')
          right = getIdentifierWithOptionalPrefix(prefix2, condition2, variables)
        }
        return action.handler(left, right)
      }
    }
    let attributes = normalize(attrs)
    let keys = attributes.map(attr => attr.key)
    const values = attributes.map(attr => attr.value)
    const actions = findActions(attributes)
    if (actions.length === 0) {
      const key = keys[0]
      const [prefix] = key.split('.')
      const node = getIdentifierWithOptionalPrefix(prefix, key, variables)
      appendIfStatement(node)
    } else if (actions.length === 1) {
      const test = getTest(actions[0], keys, values)
      appendIfStatement(test)
    } else {
      const stack = []
      const expressions = []
      for (let i = 0, ilen = attributes.length; i < ilen; i += 1) {
        let attribute = attributes[i]
        if (attribute.type === 'Identifier') {
          const value = attribute.key
          const [prefix] = value.split('.')
          const node = getIdentifierWithOptionalPrefix(prefix, value, variables)
          stack.push(node)
        } else if (attribute.type === 'Action') {
          const action = actions.find(action => action.name === attribute.key)
          if (action) {
            if (action.name === 'not') {
              i++
              attribute = attributes[i]
              const value = attribute.key
              const [prefix] = value.split('.')
              const node = {
                type: 'UnaryExpression',
                operator: '!',
                argument: getIdentifierWithOptionalPrefix(prefix, value, variables),
                prefix: true
              }
              stack.push(node)
            } else {
              if (attribute.value) {
                stack.push(convertValueToNode(attribute.value, variables))
              }
              expressions.push(action)
            }
          }
        }
      }
      const result = []
      for (let i = 0, ilen = expressions.length; i < ilen; i += 1) {
        const expression = expressions[i]
        const params = expression.args
        if (params === 1) {
          const left = stack.shift()
          const logical = expression.handler(left)
          stack.unshift(logical)
          result.push(logical)
        }
        if (params === 2) {
          const left = stack.shift()
          const right = stack.shift()
          const logical = expression.handler(left, right)
          stack.unshift(logical)
          result.push(logical)
        }
      }
      const test = result[result.length - 1]
      appendIfStatement(test)
    }
  } else if (tag === 'elseif') {
    let leaf = tree.last('IfStatement')
    if (leaf) {
      const ast = new AbstractSyntaxTree('')
      walk(fragment, current => {
        collect(ast, current, variables, modifiers, components, options)
      })
      while (leaf.alternate && leaf.alternate.type === 'IfStatement') {
        leaf = leaf.alternate
      }
      const { key } = attrs[0]
      const [prefix] = key.split('.')
      leaf.alternate = {
        type: 'IfStatement',
        test: getIdentifierWithOptionalPrefix(prefix, key, variables),
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
        collect(ast, current, variables, modifiers, components, options)
      })
      while (leaf.alternate && leaf.alternate.type === 'IfStatement') {
        leaf = leaf.alternate
      }
      leaf.alternate = {
        type: 'BlockStatement',
        body: ast.body()
      }
    }
  } else if (tag === 'for') {
    const ast = new AbstractSyntaxTree('')
    const [left, operator, right] = attrs
    let range
    if (right && right.key === 'range' && right.value) {
      if (right.value.includes('...')) {
        range = right.value.split('...').map(Number)
      } else if(right.value.includes('..')) {
        range = right.value.split('..').map(Number)
        range[1] += 1
      }
    }
    const variable = left.key
    let parent = operator.value || `{${right.key}}`
    const name = convertAttribute('html', parent, variables)

    variables.push(variable)
    parent = parent.substring(1, parent.length - 1) // TODO: Handle nested properties
    const index = getFreeIdentifier(variables.concat(parent))
    variables.push(index)
    const guard = getFreeIdentifier(variables.concat(parent))
    variables.push(guard)
    ast.append(getForLoopVariable(variable, name, variables, index, range))
    walk(fragment, current => {
      collect(ast, current, variables, modifiers, components, options)
    })
    tree.append(getForLoop(name, ast.body(), variables, index, guard, range))
    variables.pop()
    variables.pop()
    variables.pop()
  } else if (tag === 'slot') {
    if (attrs && attrs.length > 0) {
      const leaf = convertHtmlOrTextAttribute(fragment, variables)
      if (leaf) {
        tree.append(getTemplateAssignmentExpression(leaf))
      }
    } else {
      const ast = new AbstractSyntaxTree('')
      walk(fragment, current => {
        collect(ast, current, variables, modifiers, components, options)
      })
      const body = ast.body()
      body.forEach(node => tree.append(node))
    }
  } else if (tag === 'try') {
    const ast = new AbstractSyntaxTree('')
    walk(fragment, current => {
      collect(ast, current, variables, modifiers, components, options)
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
        collect(ast, current, variables, modifiers, components, options)
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
      collect(ast, current, variables, modifiers, components, options)
    })
    const { key } = attrs[0]
    const [prefix] = key.split('.')

    tree.append({
      type: 'IfStatement',
      test: {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: getIdentifierWithOptionalPrefix(prefix, key, variables)
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
        collect(ast, current, variables, modifiers, components, options)
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
          prefix: true,
          argument: getIdentifierWithOptionalPrefix(prefix, key, variables)
        },
        consequent: {
          type: 'BlockStatement',
          body: ast.body()
        }
      }
    }
  } else if (tag === 'switch') {
    const { key } = attrs[0]
    const [prefix] = key.split('.')
    tree.append({
      type: 'SwitchStatement',
      discriminant: {
        type: 'Literal',
        value: true
      },
      condition: getIdentifierWithOptionalPrefix(prefix, key, variables),
      cases: []
    })
  } else if (tag === 'case') {
    let leaf = tree.last('SwitchStatement')
    if (leaf) {
      const attributes = normalize(attrs)
      const keys = attributes.map(attr => attr.key)
      const actions = findActions(attributes)
      const action = actions[0]
      if (action) {
        const ast = new AbstractSyntaxTree('')
        walk(fragment, current => {
          collect(ast, current, variables, modifiers, components, options)
        })
        ast.append({
          type: 'BreakStatement',
          label: null
        })
        leaf.cases.push({
          type: 'SwitchCase',
          consequent: ast.body(),
          test: action.handler(leaf.condition)
        })
      }
    }
  } else if (tag === 'default') {
    let leaf = tree.last('SwitchStatement')
    if (leaf) {
      const ast = new AbstractSyntaxTree('')
      walk(fragment, current => {
        collect(ast, current, variables, modifiers, components, options)
      })
      ast.append({
        type: 'BreakStatement',
        label: null
      })
      leaf.cases.push({
        type: 'SwitchCase',
        consequent: ast.body(),
        test: null
      })
    }
  } else if (tag === 'foreach' || tag === 'each') {
    const ast = new AbstractSyntaxTree('')
    let operator, left, right, key, value

    if (attrs.length === 3) {
      [left, operator, right] = attrs
    } else if (attrs.length === 5) {
      [key, , value, operator, right] = attrs
    }

    if (left) {
      variables.push(left.key)
    } else if(key && value) {
      variables.push(key.key)
      variables.push(value.key)
    }
    walk(fragment, current => {
      collect(ast, current, variables, modifiers, components, options)
    })
    if (left) {
      variables.pop()
    } else if (left && key) {
      variables.pop()
      variables.pop()
    }
    tree.append({
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        callee: {
          type: "MemberExpression",
          object: getIdentifierWithOptionalPrefix(right.key.split('.')[0], right.key, variables),
          property: {
            type: "Identifier",
            name: tag === "foreach" ? 'forEach' : 'each'
          },
          computed: false
        },
        arguments: [
          {
            type: "FunctionExpression",
            params: [
              left ? {
                type: "Identifier",
                name: left.key
              } : null,
              key ? {
                type: 'Identifier',
                name: key.key
              } : null,
              value ? {
                type: 'Identifier',
                name: value.key
              } : null
            ].filter(Boolean),
            body: {
              type: 'BlockStatement',
              body: ast.body()
            }
          }
        ]
      }
    })
  } else if (tag === 'import') {
    collectComponentsFromImport(fragment, components, options)
  } else if (tag === 'partial' || tag === 'render') {
    collectComponentsFromPartialOrRender(fragment, options)
    fragment.children.forEach(node => {
      collect(tree, node, variables, modifiers, components, options)
    })
  }
}

module.exports = collect
