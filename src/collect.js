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
const { readFileSync } = require('fs')
const { join } = require('path')
const { parse } = require('himalaya')

function getFreeIdentifier (variables) {
  return array.identifier(variables)
}

function getIdentifierWithOptionalPrefix (prefix, key, variables) {
  return variables.includes(prefix) ? getIdentifier(key) : getObjectMemberExpression(key)
}

function findAction (keys) {
  const keywords = []
  let action

  for (let i = 0; i < keys.length; i++) {
    keywords.push(keys[i])
    action = getAction(keywords)

    if (action) return action
  }
}

function collect (tree, fragment, variables, modifiers, components) {
  if (fragment.used) return
  fragment.used = true
  const tag = fragment.tagName
  const attrs = fragment.attributes
  if (tag === 'script' && attrs[0].key === 'inline') {
    const leaf = fragment.children[0]
    leaf.used = true
    const ast = new AbstractSyntaxTree(leaf.content)
    ast.each('VariableDeclarator', node => variables.push(node.id.name))
    const body = ast.body()
    body.forEach(node => tree.append(node))
  } else if (fragment.type === 'element' && !SPECIAL_TAGS.includes(tag)) {
    const nodes = convertTag(fragment, variables, modifiers)
    nodes.forEach(node => {
      if (node.type === 'IfStatement') {
        return tree.append(node)
      }
      tree.append(getTemplateAssignmentExpression(node))
    })
    fragment.children.forEach(node => {
      collect(tree, node, variables, modifiers, components)
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
      collect(ast, current, variables, modifiers, components)
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
    const getTest = (action, keys, values) => {
      if (!action || action.args === 1) {
        const key = keys[0]
        const [prefix] = key.split('.')
        const node = getIdentifierWithOptionalPrefix(prefix, key, variables)

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

            right = getIdentifierWithOptionalPrefix(prefix, condition, variables)
            test = action.handler(left, right)
            continue
          }

          const condition1 = keys[i]
          const [prefix1] = condition1.split('.')
          left = getIdentifierWithOptionalPrefix(prefix1, condition1, variables)

          i += action.name.length //skip operator

          if (values[i]) {
            right = getLiteral(values[i])
          } else {
            const condition2 = keys[++i]
            const [prefix2] = condition2.split('.')
            right = getIdentifierWithOptionalPrefix(prefix2, condition2, variables)
          }
          test = action.handler(left, right)
        }
        return test
      }
    }
    const keys = attrs.map(attr => attr.key)
    const values = attrs.map(attr => attr.value)
    const action = findAction(keys.slice(1))
    const test = getTest(action, keys, values)
    appendIfStatement(test)
  } else if (tag === 'elseif') {
    let leaf = tree.last('IfStatement')
    if (leaf) {
      const ast = new AbstractSyntaxTree('')
      walk(fragment, current => {
        collect(ast, current, variables, modifiers, components)
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
        collect(ast, current, variables, modifiers, components)
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
      collect(ast, current, variables, modifiers, components)
    })
    tree.append(getForLoop(name, ast.body(), variables, index, guard, range))
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
      collect(ast, current, variables, modifiers, components)
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
        collect(ast, current, variables, modifiers, components)
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
      collect(ast, current, variables, modifiers, components)
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
        collect(ast, current, variables, modifiers, components)
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
      const keys = attrs.map(attr => attr.key)
      const action = findAction(keys)
      if (action) {
        const ast = new AbstractSyntaxTree('')
        walk(fragment, current => {
          collect(ast, current, variables, modifiers, components)
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
        collect(ast, current, variables, modifiers, components)
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
  } else if (tag === 'foreach') {
    const ast = new AbstractSyntaxTree('')
    const [left, operator, right] = attrs
    variables.push(left.key)
    walk(fragment, current => {
      collect(ast, current, variables, modifiers, components)
    })
    variables.pop()
    tree.append({
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        callee: {
          type: "MemberExpression",
          object: getIdentifierWithOptionalPrefix(right.key.split('.')[0], right.key, variables),
          property: {
            type: "Identifier",
            name: "forEach"
          },
          computed: false
        },
        arguments: [
          {
            type: "FunctionExpression",
            params: [
              {
                type: "Identifier",
                name: left.key
              }
            ],
            body: {
              type: 'BlockStatement',
              body: ast.body()
            }
          }
        ]
      }
    })
  } else if (tag === 'import') {
    const name = attrs[0].key
    const path = attrs[1].value
    const content = readFileSync(join(__dirname, '../test', path), 'utf8')
    components.push({ name, content })
  } else if (components.map(component => component.name).includes(tag)) {
  } else if (tag === 'partial') {
    const path = attrs[0].value
    const content = readFileSync(join(__dirname, '../test', path), 'utf8')
    fragment.children = parse(content)
  }
}

module.exports = collect
