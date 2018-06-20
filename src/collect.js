const AbstractSyntaxTree = require('abstract-syntax-tree')
const { array } = require('pure-utilities')
const {
  getIdentifier,
  getLiteral,
  getTemplateAssignmentExpression,
  getObjectMemberExpression,
  getForLoop,
  getForLoopVariable,
  getForInLoop,
  getForInLoopVariable
} = require('./factory')
const {
  convertText,
  convertTag,
  convertAttribute,
  convertToExpression,
  convertToBinaryExpression,
  convertKey
 } = require('./convert')
const { walk } = require('./parser')
const { SPECIAL_TAGS, SELF_CLOSING_TAGS, OPERATORS, OBJECT_VARIABLE } = require('./enum')
const { getAction } = require('./action')
const { readFileSync, existsSync } = require('fs')
const { join } = require('path')
const { parse } = require('himalaya')
const { normalize } = require('./array')

const digits = new Map([
  ['zero', 0],
  ['one', 1],
  ['two', 2],
  ['three', 3],
  ['four', 4],
  ['five', 5],
  ['six', 6],
  ['seven', 7],
  ['eight', 8],
  ['nine', 9],
  ['ten', 10]
])

function getFreeIdentifier (variables) {
  return array.identifier(variables)
}

function findActions (attributes) {
  return attributes
    .filter(attr => attr.type === 'Action')
    .map((attr, index, array) => {
      if (attr.key === 'is_between') array.splice([index + 1], 1)
      return getAction(attr.key)
    }).filter(Boolean)
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
      return convertKey(value, variables)
    } else if (expression.type === 'Literal') {
      return getLiteral(expression.value)
    } else if (expression.type === 'BinaryExpression') {
      AbstractSyntaxTree.replace(expression, (node, parent) => {
        if (node.type === 'MemberExpression') {
          if (node.object.type === 'Identifier' && !node.object.transformed) {
            node.object.transformed = true
            const object = getIdentifier(OBJECT_VARIABLE)
            object.transformed = true
            node.object = {
              type: 'MemberExpression',
              object,
              property: node.object
            }
          }
        }
        return node
      })
      return expression
    }
  }
  return getLiteral(value)
}

function resolveComponent (component, fragment, variables, modifiers, components, options) {
  const localVariables = fragment.attributes
  let content = component.content
  localVariables.forEach(variable => {
    content = content.replace(new RegExp(`{${variable.key}}`, 'g'), variable.value)
  })
  const htmlTree = parse(content)
  const children = fragment.children
  const currentComponents = []
  walk(htmlTree, current => {
    if (current.tagName === 'slot' || current.tagName === 'yield') {
      if (current.attributes.length === 0) {
        current.children = children
      } else {
        const name = current.attributes[0].key
        walk(children, leaf => {
          if ((leaf.tagName === 'slot' || leaf.tagName === 'yield') && leaf.attributes.length > 0 && leaf.attributes[0].key === name) {
            current.children = leaf.children
          }
        })
      }
    }
    if (current.tagName === 'import' || current.tagName === 'require') {
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

function appendIfStatement (node, tree, ast) {
  tree.append({
    type: 'IfStatement',
    test: node,
    consequent: {
      type: 'BlockStatement',
      body: ast.body()
    }
  })
}

function getTest (action, keys, values, variables) {
  if (action.args === 1) {
    const key = keys[0] === 'not' ? keys[1] : keys[0]
    const node = getLiteralOrIdentifier(key, variables)
    return action.handler(node)
  } else if (action.args === 2) {
    let left = getLiteralOrIdentifier(keys[0], variables)
    let right = values[1] ? convertValueToNode(values[1], variables) : getLiteralOrIdentifier(keys[2], variables)
    return action.handler(left, right)
  } else if (action.args === 3) {
    const node =  getLiteralOrIdentifier(keys[0], variables)
    const startRange = getLiteralOrIdentifier(keys[2], variables)
    const endRange = getLiteralOrIdentifier(keys[4], variables)
    return action.handler(node, startRange, endRange)
  }
}

function getLeftNodeFromAttribute (last, variables) {
  if (!last) return null
  return getLiteralOrIdentifier(last, variables)
}

function getRightNodeFromAttribute (current, next, variables) {
  if (current.value) return convertValueToNode(current.value, variables)
  return getLiteralOrIdentifier(next, variables)
}

function getLiteralOrIdentifier (attribute, variables) {
  const key = attribute.key || attribute
  return digits.has(key) ? getLiteral(digits.get(key)) : convertKey(key, variables)
}

function getCondition (attrs, variables) {
  let attributes = normalize(attrs)
  let keys = attributes.map(attr => attr.key)
  const values = attributes.map(attr => attr.value)
  const actions = findActions(attributes)
  if (actions.length === 0) {
    const key = keys[0]
    return convertKey(key, variables)
  } else if (actions.length === 1) {
    return getTest(actions[0], keys, values, variables)
  } else {
    const expressions = []
    for (let i = 0, ilen = attributes.length; i < ilen; i += 1) {
      const attribute = attributes[i]
      if (attribute.type === 'Identifier') {
        const last = attributes[i - 1]
        const next = attributes[i + 1]
        if (!next || OPERATORS.includes(next.key)) {
          let node = getLeftNodeFromAttribute(attribute, variables)
          if (last && last.key === 'not') {
            node = { type: 'UnaryExpression', operator: '!', prefix: true, argument: node }
          }
          expressions.push(node)
        }
      } else if (attribute.type === 'Action') {
        const action = actions.find(action => action.name === attribute.key)
        if (OPERATORS.includes(attribute.key)) {
          expressions.push(action)
        } else {
          if (action.args === 1) {
            if (action.name === 'not') {
              const next = attributes[i + 1]
              i += 1
              const left = getLeftNodeFromAttribute(next, variables)
              expressions.push(action.handler(left))
            } else {
              const previous = attributes[i - 1]
              const left = getLeftNodeFromAttribute(previous, variables)
              expressions.push(action.handler(left))
            }
          } else if (action.args === 2) {
            const previous = attributes[i - 1]
            const current = attributes[i]
            const next = attributes[i + 1]
            i += 1
            const left = getLeftNodeFromAttribute(previous, variables)
            const right = getRightNodeFromAttribute(current, next, variables)
            expressions.push(action.handler(left, right))
          } else if (action.args === 3) {
            const node = getLiteralOrIdentifier(attributes[i - 1], variables)
            const startRange = getLiteralOrIdentifier(attributes[i + 1], variables)
            const endRange = getLiteralOrIdentifier(attributes[i + 3], variables)
            expressions.push(action.handler(node, startRange, endRange))
          }
        }
      }
    }
    const stack = []
    const conditions = []
    for (let i = 0, ilen = expressions.length; i < ilen; i += 1) {
      const expression = expressions[i]
      if (OPERATORS.includes(expression.name)) {
        const left = stack.shift() || expressions[i - 1]
        const right = expressions[i + 1]
        i += 1
        const condition = expression.handler(left, right)
        stack.push(condition)
        conditions.push(condition)
      }
    }
    return conditions[conditions.length - 1]
  }
}

function collect (tree, fragment, variables, modifiers, components, store, options) {
  if (fragment.used) return
  fragment.used = true
  const tag = fragment.tagName
  const attrs = fragment.attributes
  const component = components.find(component => component.name === tag)
  if (component && !fragment.plain) {
    resolveComponent(component, fragment, variables, modifiers, components, options)
    const ast = new AbstractSyntaxTree('')
    walk(fragment, current => {
      collect(ast, current, variables, modifiers, components, store, options)
    })
    const body = ast.body()
    body.forEach(node => tree.append(node))
  } else if (tag === 'content') {
    const { key } = attrs[1]
    store[key] = fragment
    fragment.children.forEach(child => {
      child.used = true
    })
  } else if (tag === 'script' && attrs[0] && attrs[0].key === 'inline') {
    const leaf = fragment.children[0]
    leaf.used = true
    const ast = new AbstractSyntaxTree(leaf.content)
    ast.each('VariableDeclarator', node => variables.push(node.id.name))
    const body = ast.body()
    body.forEach(node => tree.append(node))
  } else if (tag === 'style' || tag === 'script' || tag === 'template') {
    let content = `<${tag}`
    fragment.attributes.forEach(attribute => {
      content += ` ${attribute.key}="${attribute.value}"`
    })
    content += '>'
    fragment.children.forEach(node => {
      node.used = true
      content += node.content
    })
    content += `</${tag}>`
    tree.append(getTemplateAssignmentExpression(getLiteral(content)))
  } else if (tag === '!doctype') {
    tree.append(getTemplateAssignmentExpression(getLiteral('<!doctype html>')))
  } else if (fragment.type === 'element' && !SPECIAL_TAGS.includes(tag)) {
    if (tag === 'svg') {
      const { value: path } = fragment.attributes[0]
      for (let i = 0, ilen = options.paths.length; i < ilen; i += 1) {
        const location = join(options.paths[i], path)
        if (!existsSync(location)) continue
        const content = parse(readFileSync(location, 'utf8'))[0]
        fragment.attributes = content.attributes
        fragment.children = content.children
        break
      }
    }
    if (attrs && attrs.map(attr => attr.key).includes('content')) {
      const { value } = attrs[0]
      if (store[value]) {
        fragment.children = store[value].children
        fragment.children.forEach(child => {
          child.used = false
        })
      }
      fragment.attributes = fragment.attributes.filter(attribute => attribute.key !== 'content')
    }
    collectComponentsFromPartialAttribute(fragment, options)
    const nodes = convertTag(fragment, variables, modifiers)
    nodes.forEach(node => {
      if (node.type === 'IfStatement') {
        return tree.append(node)
      }
      tree.append(getTemplateAssignmentExpression(node))
    })
    fragment.children.forEach(node => {
      collect(tree, node, variables, modifiers, components, store, options)
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
      collect(ast, current, variables, modifiers, components, store, options)
    })
    const condition = getCondition(attrs, variables)
    appendIfStatement(condition, tree, ast)
  } else if (tag === 'elseif') {
    let leaf = tree.last('IfStatement')
    if (leaf) {
      const ast = new AbstractSyntaxTree('')
      walk(fragment, current => {
        collect(ast, current, variables, modifiers, components, store, options)
      })
      while (leaf.alternate && leaf.alternate.type === 'IfStatement') {
        leaf = leaf.alternate
      }
      const condition = getCondition(attrs, variables)
      leaf.alternate = {
        type: 'IfStatement',
        test: condition,
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
        collect(ast, current, variables, modifiers, components, store, options)
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
    if (attrs.length <= 3) {
      const ast = new AbstractSyntaxTree('')
      const [left, operator, right] = attrs
      let range
      if (right && right.key === 'range' && right.value) {
        if (right.value.includes('...')) {
          range = right.value.split('...').map(Number)
        } else if (right.value.includes('..')) {
          range = right.value.split('..').map(Number)
          range[1] += 1
        } else {
          range = [0, Number(right.value) + 1]
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
        collect(ast, current, variables, modifiers, components, store, options)
      })
      tree.append(getForLoop(name, ast.body(), variables, index, guard, range))
      variables.pop()
      variables.pop()
      variables.pop()
    } else if (attrs.length <= 5) {
      const ast = new AbstractSyntaxTree('')
      const [key, , value, operator, right] = attrs
      const keyIdentifier = key.key
      const valueIdentifier = value.key
      variables.push(keyIdentifier)
      variables.push(valueIdentifier)

      let parent = operator.value || `{${right.key}}`
      const name = convertAttribute('html', parent, variables)
      ast.append(getForInLoopVariable(keyIdentifier, valueIdentifier, name))

      walk(fragment, current => {
        collect(ast, current, variables, modifiers, components, store, options)
      })
      tree.append(getForInLoop(keyIdentifier, name, ast.body()))
      variables.pop()
      variables.pop()
    }
  } else if (tag === 'slot' || tag === 'yield') {
    const ast = new AbstractSyntaxTree('')
    walk(fragment, current => {
      collect(ast, current, variables, modifiers, components, store, options)
    })
    const body = ast.body()
    body.forEach(node => tree.append(node))
  } else if (tag === 'try') {
    const ast = new AbstractSyntaxTree('')
    walk(fragment, current => {
      collect(ast, current, variables, modifiers, components, store, options)
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
        collect(ast, current, variables, modifiers, components, store, options)
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
      collect(ast, current, variables, modifiers, components, store, options)
    })
    const { key } = attrs[0]
    tree.append({
      type: 'IfStatement',
      test: {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: convertKey(key, variables)
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
        collect(ast, current, variables, modifiers, components, store, options)
      })
      while (leaf.alternate && leaf.alternate.type === 'IfStatement') {
        leaf = leaf.alternate
      }
      const { key } = attrs[0]
      leaf.alternate = {
        type: 'IfStatement',
        test: {
          type: 'UnaryExpression',
          operator: '!',
          prefix: true,
          argument: convertKey(key, variables)
        },
        consequent: {
          type: 'BlockStatement',
          body: ast.body()
        }
      }
    }
  } else if (tag === 'switch') {
    tree.append({
      type: 'SwitchStatement',
      discriminant: {
        type: 'Literal',
        value: true
      },
      attribute: attrs[0],
      cases: []
    })
  } else if (tag === 'case') {
    let leaf = tree.last('SwitchStatement')
    if (leaf) {
      const attributes = [leaf.attribute]
      attrs.forEach(attr => {
        attributes.push(attr)
        if (OPERATORS.includes(attr.key)) {
          attributes.push(leaf.attribute)
        }
      })
      const condition = getCondition(attributes, variables)
      const ast = new AbstractSyntaxTree('')
      walk(fragment, current => {
        collect(ast, current, variables, modifiers, components, store, options)
      })
      ast.append({
        type: 'BreakStatement',
        label: null
      })
      leaf.cases.push({
        type: 'SwitchCase',
        consequent: ast.body(),
        test: condition
      })
    }
  } else if (tag === 'default') {
    let leaf = tree.last('SwitchStatement')
    if (leaf) {
      const ast = new AbstractSyntaxTree('')
      walk(fragment, current => {
        collect(ast, current, variables, modifiers, components, store, options)
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
    let left, right, key, value

    if (attrs.length === 3) {
      [left, , right] = attrs
    } else if (attrs.length === 5) {
      [key, , value, , right] = attrs
    }

    if (left) {
      variables.push(left.key)
    } else if (key && value) {
      variables.push(key.key)
      variables.push(value.key)
    }
    walk(fragment, current => {
      collect(ast, current, variables, modifiers, components, store, options)
    })
    if (left) {
      variables.pop()
    } else if (left && key) {
      variables.pop()
      variables.pop()
    }
    tree.append({
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: convertKey(right.key, variables),
          property: {
            type: 'Identifier',
            name: tag === 'foreach' ? 'forEach' : 'each'
          },
          computed: false
        },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [
              left ? {
                type: 'Identifier',
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
  } else if (tag === 'import' || tag === 'require') {
    collectComponentsFromImport(fragment, components, options)
  } else if (tag === 'partial' || tag === 'render') {
    collectComponentsFromPartialOrRender(fragment, options)
    fragment.children.forEach(node => {
      collect(tree, node, variables, modifiers, components, store, options)
    })
  }
}

module.exports = collect
