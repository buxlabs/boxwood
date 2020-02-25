const AbstractSyntaxTree = require('abstract-syntax-tree')
const { getLiteral } = require('./ast')
const { getTemplateAssignmentExpression, getObjectMemberExpression } = require('./factory')
const { convertText, convertTag, convertToExpression } = require('./convert')
const walk = require('himalaya-walk')
const { SPECIAL_TAGS, SELF_CLOSING_TAGS } = require('./enum')
const { join, dirname } = require('path')
const { parse } = require('./html')
const { normalize } = require('./array')
const { clone } = require('./object')
const { addPlaceholders, placeholderName } = require('./keywords')
const { isCurlyTag, isSquareTag, isImportTag, getTagValue, extract } = require('./string')
const Component = require('../Component')
const Bundler = require('../Bundler')
const tags = require('../tags')
const { hasShorthandSyntax, normalizeAttributes } = require('./node')
const { getComponentNames } = require('./attributes')
const { findAsset } = require('./files')
const { getScopeProperties } = require('./scope')
let asyncCounter = 0

function collectComponentsFromImport (fragment, components, component, assets, options) {
  const attrs = fragment.attributes
  const names = getComponentNames(attrs)
  if (names.length === 1) {
    const name = names[0]
    if (!hasShorthandSyntax(fragment)) {
      const path = attrs[1].value
      collectComponent(name, path, components, component, assets, options)
    } else {
      const lastAttribute = attrs[attrs.length - 1]
      const dir = lastAttribute.value
      const path = join(dir, `${name}.html`)
      collectComponent(name, path, components, component, assets, options)
    }
  } else {
    const lastAttribute = attrs[attrs.length - 1]
    const dir = lastAttribute.value
    names.forEach(name => {
      const path = join(dir, `${name}.html`)
      collectComponent(name, path, components, component, assets, options)
    })
  }
}

function collectComponent (name, path, components, component, assets, options) {
  let paths = [].concat(options.paths)
  if (component) {
    paths = paths.concat(dirname(component.path))
  }
  if (components) {
    paths = paths.concat(components.map(component => dirname(component.path)))
  }
  const asset = findAsset(path, assets, { paths, aliases: options.aliases })
  if (!asset) return
  const content = asset.source
  const { files } = asset
  components.push({ name, content, files, path: asset.path })
}

function runPlugins (htmlTree, content, plugins, assets, errors, options) {
  plugins.forEach(plugin => {
    plugin.depth += 1
    plugin.beforeprerun()
  })
  walk(htmlTree, leaf => {
    try {
      const attrs = leaf.attributes || []
      const keys = attrs.map(attribute => attribute.key)
      plugins.forEach(plugin => {
        plugin.prerun({
          source: content,
          tag: leaf.tagName,
          keys,
          attrs,
          fragment: leaf,
          options,
          assets,
          ...leaf
        })
      })
    } catch (exception) {
      errors.push(exception)
    }
  })
  plugins.forEach(plugin => { plugin.afterprerun() })
  plugins.forEach(plugin => { plugin.beforerun() })
  walk(htmlTree, leaf => {
    try {
      const attrs = leaf.attributes || []
      const keys = attrs.map(attribute => attribute.key)
      plugins.forEach(plugin => {
        plugin.run({
          source: content,
          tag: leaf.tagName,
          keys,
          attrs,
          fragment: leaf,
          assets,
          options,
          ...leaf
        })
      })
    } catch (exception) {
      errors.push(exception)
    }
  })
  plugins.forEach(plugin => {
    plugin.afterrun()
    plugin.depth -= 1
  })
}

function collectComponentsFromPartialOrRender (fragment, assets, context, plugins, errors, options) {
  const path = fragment.attributes[0].value
  let paths = [].concat(options.paths)
  if (context) {
    paths = [dirname(context)].concat(paths)
  }
  const asset = findAsset(path, assets, { paths, aliases: options.aliases })
  if (!asset) return

  const content = asset.source
  const htmlTree = parse(content)
  const localVariables = normalizeAttributes(fragment.attributes)
  walk(htmlTree, leaf => {
    leaf.context = asset.path
    if (localVariables.length > 0) {
      inlineLocalVariablesInFragment(leaf, localVariables)
    }
    inlineAttributesInIfStatement(leaf)
  })
  walk(htmlTree, leaf => {
    if (localVariables.length > 0) {
      inlineExpressions(leaf, null, localVariables)
    }
  })
  runPlugins(htmlTree, content, plugins, assets, errors, options)
  fragment.children = htmlTree
}

function inlineLocalVariablesInFragment (leaf, localVariables) {
  if (leaf.type === 'text') {
    localVariables.forEach(variable => {
      if (!isCurlyTag(variable.value)) {
        leaf.content = leaf.content.replace(new RegExp(`{${variable.key}}`, 'g'), variable.value)
      }
    })
  }
  if (leaf.attributes && leaf.attributes.length > 0) {
    leaf.attributes.forEach(attribute => {
      if (isCurlyTag(attribute.key)) {
        const key = getTagValue(attribute.key)
        const variable = localVariables.find(localVariable => {
          return localVariable.key === key
        })
        if (variable) {
          attribute.key = variable.key
          attribute.value = variable.value
        }
      }
    })
  }
}

function inlineAttributesInIfStatement (leaf) {
  if (leaf.tagName === 'if') {
    const normalizedAttributes = normalize(leaf.attributes)

    leaf.attributes = normalizedAttributes.map(attr => {
      // TODO handle or remove words to numbers functionality
      if (attr.type === 'Identifier' && !isCurlyTag(attr.key)) {
        attr.key = `{${attr.key}}`
      }
      return attr
    })
  }
}

function inlineExpressions (leaf, component, localVariables) {
  if (component) { leaf.imported = true }
  if (component && leaf.tagName === component.name) {
    // TODO allow inlined components to have
    // the same name as imported one
    // the limitation can be unexpected
    leaf.root = true
  }
  if (leaf.attributes) {
    leaf.attributes.forEach(attr => {
      const { key, value } = attr
      function inlineExpression (type, attr, string) {
        if (!string) return
        const parts = extract(string)
        const result = parts.reduce((accumulator, node) => {
          const { value } = node
          if (node.type === 'text' && !isSquareTag(value)) {
            return accumulator + value
          }
          const input = isSquareTag(value) ? value : getTagValue(value)
          if (isCurlyTag(input)) { return accumulator + value }
          const source = addPlaceholders(input)
          const ast = new AbstractSyntaxTree(source)
          let replaced = false
          ast.replace({
            enter: (node, parent) => {
              // TODO investigate
              // this is too optimistic
              if (node.type === 'Identifier' && (!parent || parent.type !== 'MemberExpression')) {
                const variable = localVariables.find(variable => variable.key === node.name || placeholderName(variable.key) === node.name)
                if (variable) {
                  replaced = true
                  if (isCurlyTag(variable.value)) {
                    return convertToExpression(getTagValue(variable.value))
                  }
                  return { type: 'Literal', value: variable.value }
                }
              }
              return node
            }
          })
          if (replaced) {
            if (isSquareTag(value)) {
              return accumulator + ast.source.replace(/;\n$/, '')
            }
            return accumulator + '{' + ast.source.replace(/;\n$/, '') + '}'
          } else if (node.filters && node.filters.length > 0) {
            return accumulator + node.original
          }
          return accumulator + value
        }, '')
        attr[type] = result
      }

      inlineExpression('key', attr, key)
      inlineExpression('value', attr, value)
    })
  }
}

function collectComponentsFromPartialAttribute (fragment, assets, context, plugins, errors, options) {
  const attr = fragment.attributes.find(attr => attr.key === 'partial')
  if (attr) {
    const path = attr.value
    let paths = [].concat(options.paths)
    if (context) {
      paths = [dirname(context)].concat(paths)
    }
    const asset = findAsset(path, assets, { paths, aliases: options.aliases })
    if (!asset) return
    const content = asset.source
    const htmlTree = parse(content)
    const localVariables = normalizeAttributes(fragment.attributes)
    walk(htmlTree, leaf => {
      leaf.context = asset.path
      if (localVariables.length > 0) {
        inlineLocalVariablesInFragment(leaf, localVariables)
      }
      inlineAttributesInIfStatement(leaf)
    })
    walk(htmlTree, leaf => {
      if (localVariables.length > 0) {
        inlineExpressions(leaf, null, localVariables)
      }
    })
    runPlugins(htmlTree, content, plugins, assets, errors, options)
    fragment.attributes = []
    fragment.children = htmlTree
  }
}

function collectInlineComponents (fragment, attributes, components) {
  const { key } = attributes[attributes.length - 1]
  const { content } = fragment.children[0]
  components.push({ name: key, files: ['.'], content, path: null })
  fragment.children.forEach(child => {
    child.used = true
  })
}

function resolveComponent (tree, component, fragment, components, plugins, errors, assets, options) {
  const localVariables = normalizeAttributes(fragment.attributes)
  const htmlComponent = new Component(component.content, localVariables)
  htmlComponent.optimize()
  const content = htmlComponent.source

  const htmlTree = parse(content)
  let children = fragment.children
  walk(htmlTree, leaf => {
    leaf.context = component.path
    if (localVariables.length > 0) {
      inlineLocalVariablesInFragment(leaf, localVariables)
    }
    inlineAttributesInIfStatement(leaf)
  })
  walk(htmlTree, leaf => {
    inlineExpressions(leaf, component, localVariables)
  })
  runPlugins(htmlTree, content, plugins, assets, errors, options)
  const currentComponents = []
  let slots = 0
  walk(htmlTree, async (current, parent) => {
    const attrs = current.attributes || []
    const keys = attrs.map(attr => attr.key)
    if (isImportTag(current.tagName)) {
      collectComponentsFromImport(current, currentComponents, component, assets, options)
    } else if (current.tagName === 'partial' || current.tagName === 'render' || current.tagName === 'include') {
      collectComponentsFromPartialOrRender(current, assets, component.path, plugins, errors, options)
    } else if (current.attributes && current.attributes[0] && current.attributes[0].key === 'partial') {
      collectComponentsFromPartialAttribute(current, assets, component.path, plugins, errors, options)
    } else if (
      (current.tagName === 'template' && keys.length > 0) ||
      (current.tagName === 'script' && keys.includes('component'))
    ) {
      collectInlineComponents(current, attrs, currentComponents)
    }
    const currentComponent = currentComponents.find(component => component.name === current.tagName)
    if (currentComponent && !current.root) {
      resolveComponent(tree, currentComponent, current, components, plugins, errors, assets, options)
      current.used = true
    }
    if ((current.tagName === 'slot' || current.tagName === 'yield') && current.children.length === 0) {
      if (current.attributes.length === 0) {
        // putting a slot into a slot is problematic
        if (children.length === 1 && children[0].tagName === 'slot') {
          children = children[0].children
        }
        if (slots === 0) {
          current.children = children
        } else {
          current.children = clone(children)
        }
        slots += 1
      } else {
        const name = current.attributes[0].key
        walk(children, leaf => {
          if ((leaf.tagName === 'slot' || leaf.tagName === 'yield') && leaf.attributes.length > 0 && leaf.attributes[0].key === name) {
            // the following might not be super performant in case of components with multiple slots
            // we could do this only if a slot with given name is not unique (e.g. in if / else statements)
            if (slots > 2) {
              current.children = clone(leaf.children)
            } else {
              current.children = leaf.children
            }
            slots += 1
          }
        })
      }
    }
  })
  fragment.children = htmlTree
  // component usage, e.g. <list></list>
  // can be imported in the top component as well
  // which would result in unnecessary evaluation
  // we need to ignore it
  // but we can't ignore children nodes
  // can we do it better than marking the node as a slot?
  fragment.tagName = 'slot'
  return { fragment, localVariables }
}

async function collect ({ source, tree, fragment, assets, variables, filters, components, styles, translations, plugins, store, depth, options, promises, errors, warnings }) {
  function collectChildren (fragment, ast) {
    walk(fragment, async current => {
      await collect({ source, tree: ast, fragment: current, assets, variables, filters, components, styles, translations, plugins, store, depth, options, promises, errors, warnings })
    })
  }
  try {
    if (fragment.used) return
    depth += 1
    fragment.used = true
    const tag = fragment.tagName
    const attrs = fragment.attributes
    const keys = attrs ? attrs.map(attr => attr.key) : []
    const context = fragment.context || '.'
    const component = components.find(component => component.name === tag && component.files && component.files.includes(context))
    const { languages } = options
    plugins.forEach(plugin => {
      plugin.run({
        source,
        tag,
        keys,
        attrs,
        fragment,
        assets,
        options,
        ...fragment
      })
    })
    if (component && !fragment.imported) {
      const { localVariables } = resolveComponent(tree, component, fragment, components, plugins, errors, assets, options)
      localVariables.forEach(variable => variables.push(variable.key))
      const ast = new AbstractSyntaxTree('')
      collectChildren(fragment, ast)
      // TODO instead of doing this we could pass the variables down the road together
      // with the values and set them there instead of replacing here
      // if the passed value is an expression we could assign it to a free variable
      // and then use inside of the template
      // this would have a better performance than the current solution

      // this part of the code also deserves to have more specs
      // e.g. this possibly will cause issues if the identifier is a part of a more complex node

      // similar code is in the getTemplateNode / convert.js
      // we could consider changing the variables format and having info if it's a local or global
      // variable and inline it there
      // so that the replacement code is only in one place
      ast.replace({
        enter: node => {
          if (node.type === 'Identifier' && !node.inlined && !node.omit) {
            const localVariable = localVariables.find(variable => variable.key === node.name)
            if (localVariable) {
              const variablesExcludingLocalVariable = variables.filter(variable => variable !== localVariable.key)
              const node = convertText(localVariable.value, variablesExcludingLocalVariable, filters, translations, languages, true)[0]
              AbstractSyntaxTree.walk(node, leaf => { leaf.inlined = true })
              return node
            }
          }
        }
      })
      ast.body.forEach(node => tree.append(node))
      localVariables.forEach(() => variables.pop())
    } else if (tag === 'translate') {
      tags.translate({ tree, fragment, attrs, options, filters, variables, translations, languages })
    } else if (tag === 'content') {
      const { key } = attrs[1]
      store[key] = fragment
      fragment.children.forEach(child => {
        child.used = true
      })
    } else if (
      (tag === 'template' && keys.length > 0) ||
      (tag === 'script' && keys.includes('component'))
    ) {
      collectInlineComponents(fragment, attrs, components)
    } else if ((tag === 'script' && keys.includes('inline')) || options.inline.includes('scripts')) {
      if (keys.includes('src')) {
        const { value: path } = attrs.find(attr => attr.key === 'src')
        const asset = findAsset(path, assets, options)
        if (!asset) return
        let content = '<script'
        fragment.attributes.forEach(attribute => {
          const { key, value } = attribute
          if (key !== 'src' && key !== 'inline') {
            content += ` ${key}="${value}"`
          }
        })
        content += '>'
        content += asset.source.trim()
        content += '</script>'
        tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral(content)))
      } else {
        const leaf = fragment.children[0]
        leaf.used = true
        const ast = new AbstractSyntaxTree(leaf.content)
        ast.each('VariableDeclarator', node => variables.push(node.id.name))
        ast.body.forEach(node => tree.append(node))
      }
    } else if (tag === 'script' && keys.includes('scoped')) {
      const leaf = fragment.children[0]
      const scope = new AbstractSyntaxTree(leaf.content)
      const properties = getScopeProperties(scope)
      leaf.used = true
      tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral('<script>')))
      if (properties.length > 0) {
        tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral('const scope = ')))
        tree.append(getTemplateAssignmentExpression(options.variables.template, {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'Identifier',
              name: 'JSON'
            },
            property: {
              type: 'Identifier',
              name: 'stringify'
            },
            computed: false
          },
          arguments: [
            {
              type: 'ObjectExpression',
              properties
            }
          ]
        }))
        tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral(';')))
      }
      asyncCounter += 1
      const ASYNC_PLACEHOLDER_TEXT = `ASYNC_PLACEHOLDER_${asyncCounter}`
      tree.append(getLiteral(ASYNC_PLACEHOLDER_TEXT))
      const bundler = new Bundler()
      const promise = bundler.bundle(leaf.content, { paths: options.script.paths, resolve: options.script.resolve })
      promises.push(promise)
      const result = await promise
      tree.walk((node, parent) => {
        if (node.type === 'Literal' && node.value === ASYNC_PLACEHOLDER_TEXT) {
          const index = parent.body.findIndex(element => {
            return element.type === 'Literal' && node.value === ASYNC_PLACEHOLDER_TEXT
          })
          parent.body.splice(index, 1)
          parent.body.splice(index + 0, 0, getTemplateAssignmentExpression(options.variables.template, getLiteral(`\n${result}`)))
          parent.body.splice(index + 1, 0, getTemplateAssignmentExpression(options.variables.template, getLiteral('</script>')))
        }
      })
    } else if (tag === 'script' && keys.includes('compiler')) {
      const { value } = attrs.find(attr => attr.key === 'compiler')
      const compiler = options.compilers[value]
      if (typeof compiler === 'function') {
        const attr = attrs.find(attr => attr.key === 'options')
        let params
        if (attr && attr.value) {
          params = JSON.parse(attr.value)
        }
        const leaf = fragment.children[0]
        leaf.used = true
        const result = compiler(leaf.content, params)
        if (typeof result === 'string') {
          tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral('<script>')))
          tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral(result)))
          tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral('</script>')))
        } else if (result instanceof Promise) {
          asyncCounter += 1
          const ASYNC_PLACEHOLDER_TEXT = `ASYNC_PLACEHOLDER_${asyncCounter}`
          tree.append(getLiteral(ASYNC_PLACEHOLDER_TEXT))
          promises.push(result)
          const source = await result
          tree.walk((node, parent) => {
            if (node.type === 'Literal' && node.value === ASYNC_PLACEHOLDER_TEXT) {
              const index = parent.body.findIndex(element => {
                return element.type === 'Literal' && node.value === ASYNC_PLACEHOLDER_TEXT
              })
              parent.body.splice(index, 1)
              parent.body.splice(index + 0, 0, getTemplateAssignmentExpression(options.variables.template, getLiteral('<script>')))
              parent.body.splice(index + 1, 0, getTemplateAssignmentExpression(options.variables.template, getLiteral(source)))
              parent.body.splice(index + 2, 0, getTemplateAssignmentExpression(options.variables.template, getLiteral('</script>')))
            }
          })
        }
      }
    } else if (tag === 'link' && (keys.includes('inline') || options.inline.includes('stylesheets'))) {
      const { value: path } = attrs.find(attr => attr.key === 'href')
      const asset = findAsset(path, assets, options)
      if (!asset) return
      styles.push(asset.source.trim())
    } else if (tag === 'style') {
      const { content } = fragment.children[0]
      styles.push(content)
      fragment.children[0].used = true
    } else if (tag === 'script' || tag === 'template') {
      let content = `<${tag}`
      fragment.attributes.forEach(attribute => {
        if (tag === 'style' && attribute.key === 'scoped') return
        if (attribute.value) {
          content += ` ${attribute.key}="${attribute.value}"`
        } else {
          content += ` ${attribute.key}`
        }
      })
      content += '>'
      fragment.children.forEach(node => {
        node.used = true
        content += node.content
      })
      content += `</${tag}>`
      tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral(content)))
    } else if (tag === '!doctype') {
      tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral('<!doctype html>')))
    } else if (fragment.type === 'element' && !SPECIAL_TAGS.includes(tag)) {
      if (tag === 'svg' && keys.includes('from')) {
        const found = tags.svg({ fragment, attrs, assets, options })
        if (!found) return
      } else if (tag === 'img') {
        tags.img({ fragment, attrs, keys, assets, options })
      }
      if (keys.includes('content')) {
        const { value } = attrs[0]
        if (store[value]) {
          fragment.children = store[value].children
          fragment.children.forEach(child => {
            child.used = false
          })
        }
        if (fragment.tagName !== 'meta') {
          fragment.attributes = fragment.attributes.filter(attribute => attribute.key !== 'content')
        }
      }
      collectComponentsFromPartialAttribute(fragment, assets, null, plugins, errors, options)
      const nodes = convertTag(fragment, variables, filters, translations, languages, options)
      nodes.forEach(node => {
        if (node.type === 'IfStatement') {
          node.depth = depth
          return tree.append(node)
        }
        tree.append(getTemplateAssignmentExpression(options.variables.template, node))
      })
      collectChildren(fragment, tree)
      if (!SELF_CLOSING_TAGS.includes(tag)) {
        const attr = fragment.attributes.find(attr => attr.key === 'tag' || attr.key === 'tag|bind')
        if (attr) {
          const property = attr.key === 'tag' ? attr.value.substring(1, attr.value.length - 1) : attr.value
          tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral('</')))
          tree.append(getTemplateAssignmentExpression(options.variables.template, getObjectMemberExpression(property)))
          tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral('>')))
        } else {
          tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral(`</${tag}>`)))
        }
      }
    } else if (fragment.type === 'text') {
      const nodes = convertText(fragment.content, variables, filters, translations, languages)
      return nodes.forEach(node => tree.append(getTemplateAssignmentExpression(options.variables.template, node)))
    } else if (tag === 'if') {
      tags.if({ fragment, tree, attrs, variables, filters, translations, languages, warnings, depth, collectChildren })
    } else if (tag === 'elseif') {
      tags.elseif({ fragment, tree, attrs, variables, filters, translations, languages, warnings, depth, collectChildren })
    } else if (tag === 'else') {
      tags.else({ fragment, tree, depth, collectChildren })
    } else if (tag === 'for') {
      tags.for({ fragment, tree, attrs, variables, translations, languages, collectChildren })
    } else if (tag === 'slot' || tag === 'yield') {
      tags.slot({ fragment, tree, collectChildren })
    } else if (tag === 'try') {
      tags.try({ fragment, tree, options, collectChildren })
    } else if (tag === 'catch') {
      tags.catch({ fragment, tree, collectChildren })
    } else if (tag === 'unless') {
      tags.unless({ fragment, tree, attrs, variables, depth, collectChildren })
    } else if (tag === 'elseunless') {
      tags.elseunless({ fragment, tree, attrs, variables, depth, collectChildren })
    } else if (tag === 'switch') {
      tags.switch({ tree, attrs })
    } else if (tag === 'case') {
      tags.case({ fragment, tree, attrs, variables, collectChildren })
    } else if (tag === 'default') {
      tags.default({ fragment, tree, collectChildren })
    } else if (tag === 'foreach' || tag === 'each') {
      tags.foreach({ fragment, tree, variables, attrs, collectChildren })
    } else if (isImportTag(tag)) {
      collectComponentsFromImport(fragment, components, null, assets, options)
    } else if (tag === 'partial' || tag === 'render' || tag === 'include') {
      collectComponentsFromPartialOrRender(fragment, assets, null, plugins, errors, options)
    } else if (tag === 'markdown') {
      tags.markdown({ fragment, tree })
    } else if (tag === 'font') {
      tags.font({ fragment, tree, options })
    } else if (tag === 'spacing') {
      tags.spacing({ fragment, tree, options })
    } else if (tag === 'space') {
      tags.space({ tree, attrs })
    } else if (tag === 'entity') {
      tags.entity({ tree, options, attrs })
    }
    depth -= 1
  } catch (exception) {
    errors.push(exception)
  }
}

module.exports = collect
