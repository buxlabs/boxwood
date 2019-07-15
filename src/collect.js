const AbstractSyntaxTree = require('abstract-syntax-tree')
const { getLiteral } = require('./ast')
const { getTemplateAssignmentExpression, getObjectMemberExpression } = require('./factory')
const { getTranslateCallExpression } = require('./translations')
const { convertText, convertTag, convertToExpression } = require('./convert')
const walk = require('himalaya-walk')
const { SPECIAL_TAGS, SELF_CLOSING_TAGS, OBJECT_VARIABLE } = require('./enum')
const { join, dirname } = require('path')
const parse = require('./html/parse')
const size = require('image-size')
const { normalize } = require('./array')
const { clone } = require('./object')
const { addPlaceholders, placeholderName } = require('./keywords')
const { isCurlyTag, isImportTag, getTagValue } = require('./string')
const { extractComponentNames } = require('./extract')
const Component = require('./Component/')
const foreachTag = require('./tags/foreach')
const forTag = require('./tags/for')
const tryTag = require('./tags/try')
const catchTag = require('./tags/catch')
const unlessTag = require('./tags/unless')
const elseunlessTag = require('./tags/elseunless')
const switchTag = require('./tags/switch')
const caseTag = require('./tags/case')
const markdownTag = require('./tags/markdown')
const fontTag = require('./tags/font')
const { getCondition } = require('./conditions')
const normalizeNewline = require('normalize-newline')
const { hasShorthandSyntax } = require('./node')
const { findAsset } = require('./files')
const { SVGError } = require('./errors')
let asyncCounter = 0

function setDimension (fragment, attrs, keys, dimension, assets, options) {
  if (keys.includes(dimension)) {
    const attr = attrs.find(attr => attr.key === dimension)
    if (attr.value === 'auto') {
      const { value: path } = attrs.find(attr => attr.key === 'src')
      const asset = findAsset(path, assets, options)
      if (!asset) return
      try {
        const dimensions = size(asset.buffer)
        fragment.attributes = fragment.attributes.map(attr => {
          if (attr.key === dimension) {
            attr.value = dimensions[dimension].toString()
          }
          return attr
        })
      } catch (exception) {
        // TODO: Add a warning. The image cannot be parsed.
      }
    }
  }
}

function attributeToStyle (attributeName, styles, attrs) {
  const index = attrs.findIndex(attr => attr.key === attributeName)
  const styleAttributeIndex = attrs.findIndex(attr => attr.key === 'style')
  if (index !== -1) {
    attrs.splice(index, 1)
    if (styleAttributeIndex === -1) {
      attrs.push({ key: 'style', value: styles })
    } else {
      attrs[styleAttributeIndex].value += ` ${styles}`
    }
  }
}

function collectComponentsFromImport (fragment, components, component, assets, options) {
  const attrs = fragment.attributes
  const names = extractComponentNames(attrs)
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
  components.push({ name, content, path: asset.path })
}

function runPlugins (htmlTree, content, plugins, assets, errors, options) {
  plugins.forEach(plugin => { plugin.beforeprerun() })
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
  plugins.forEach(plugin => { plugin.afterrun() })
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
  const localVariables = normalizeLocalVariables(fragment.attributes)
  walk(htmlTree, leaf => {
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
        if (
          string &&
          string.startsWith('{') &&
          string.endsWith('}') &&
          // TODO reuse
          // add occurances method to pure-utilities
          (string.match(/{/g) || []).length === 1 &&
          (string.match(/}/g) || []).length === 1
        ) {
          let source = string.substr(1, string.length - 2)
          source = addPlaceholders(source)
          const ast = new AbstractSyntaxTree(source)
          let replaced = false
          ast.replace({
            enter: (node, parent) => {
              // TODO investigate
              // this is too optimistic
              if (node.type === 'Identifier' && (!parent || parent.type !== 'MemberExpression')) {
                const variable = localVariables.find(variable => variable.key === node.name || variable.key === placeholderName(node.name))
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
            attr[type] = '{' + ast.source.replace(/;\n$/, '') + '}'
          }
        }
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
    const localVariables = normalizeLocalVariables(fragment.attributes)
    walk(htmlTree, leaf => {
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
  components.push({ name: key, content, path: null })
  fragment.children.forEach(child => {
    child.used = true
  })
}

function normalizeLocalVariables (attributes) {
  return attributes.map(attribute => {
    if (attribute.value === null) { attribute.value = '{true}' }
    return attribute
  })
}

function resolveComponent (tree, component, fragment, components, plugins, errors, assets, options) {
  const localVariables = normalizeLocalVariables(fragment.attributes)

  let content
  const htmlComponent = new Component(component.content, localVariables)
  htmlComponent.optimize()
  content = htmlComponent.source

  const htmlTree = parse(content)
  let children = fragment.children
  // const localVariables = normalizeLocalVariables(fragment.attributes)
  walk(htmlTree, leaf => {
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

function getExtension (value) {
  const parts = value.split('.')
  const extension = parts[parts.length - 1]
  return extension === 'svg' ? 'svg+xml' : extension
}

async function collect ({ source, tree, fragment, assets, variables, filters, components, styles, translations, plugins, store, depth, options, promises, errors }) {
  function collectChildren (fragment, ast) {
    walk(fragment, async current => {
      await collect({ source, tree: ast, fragment: current, assets, variables, filters, components, styles, translations, plugins, store, depth, options, promises, errors })
    })
  }

  try {
    if (fragment.used) return
    depth += 1
    fragment.used = true
    const tag = fragment.tagName
    const attrs = fragment.attributes
    const keys = attrs ? attrs.map(attr => attr.key) : []
    const component = components.find(component => component.name === tag)
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
      const attribute = attrs[0]
      const { key } = attribute
      tree.append(getTemplateAssignmentExpression(options.variables.template, getTranslateCallExpression(key, variables, filters, translations, languages)))
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
        let content = `<script`
        fragment.attributes.forEach(attribute => {
          const { key, value } = attribute
          if (key !== 'src' && key !== 'inline') {
            content += ` ${key}="${value}"`
          }
        })
        content += '>'
        content += asset.source.trim()
        content += `</script>`
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
      leaf.used = true
      tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral('<script>')))
      tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral('const scope = ')))
      tree.append(getTemplateAssignmentExpression(options.variables.template, {
        type: 'ExpressionStatement',
        expression: {
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
              type: 'Identifier',
              name: OBJECT_VARIABLE
            }
          ]
        }
      }))
      tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral(`\n${leaf.content}`)))
      tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral('</script>')))
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
        const attr = attrs.find(attr => attr.key === 'from')
        const { value: path } = attr
        if (!path) { throw new SVGError('Attribute empty on the svg tag: from.') }
        const asset = findAsset(path, assets, options)
        if (!asset) return
        const content = parse(normalizeNewline(asset.source).trim())[0]
        fragment.attributes = content.attributes
        fragment.children = content.children
      } else if (tag === 'img') {
        const sizeAttributeIndex = attrs.findIndex(attr => attr.key === 'size')
        attributeToStyle('fluid', 'max-width: 100%; height: auto;', attrs)
        attributeToStyle('cover', 'object-fit: cover; object-position: right top;', attrs)
        attributeToStyle('contain', 'object-fit: contain; object-position: center;', attrs)
        if (sizeAttributeIndex !== -1) {
          const [width, height] = attrs[sizeAttributeIndex].value.split('x')
          attrs.push({ key: 'width', value: width })
          attrs.push({ key: 'height', value: height })
          attrs.splice(sizeAttributeIndex, 1)
        }
        setDimension(fragment, attrs, keys, 'width', assets, options)
        setDimension(fragment, attrs, keys, 'height', assets, options)
        if (keys.includes('inline') || options.inline.includes('images')) {
          fragment.attributes = fragment.attributes.map(attr => {
            if (attr.key === 'inline') return null
            if (attr.key === 'src') {
              const extension = getExtension(attr.value)
              const extensions = ['png', 'jpg', 'jpeg', 'gif', 'svg+xml']
              if (extensions.includes(extension)) {
                const path = attr.value
                const asset = findAsset(path, assets, options)
                if (!asset) return
                const string = asset.base64
                const content = normalizeNewline(string).trim()
                attr.value = `data:image/${extension};base64, ${content}`
              }
            }
            return attr
          }).filter(Boolean)
        }
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
      const ast = new AbstractSyntaxTree('')
      collectChildren(fragment, ast)
      const condition = getCondition(attrs, variables, filters, translations, languages)
      tree.append({
        type: 'IfStatement',
        test: condition,
        consequent: {
          type: 'BlockStatement',
          body: ast.body
        },
        depth
      })
    } else if (tag === 'elseif') {
      let leaf = tree.last(`IfStatement[depth="${depth}"]`)
      if (leaf) {
        const ast = new AbstractSyntaxTree('')
        collectChildren(fragment, ast)
        while (leaf.alternate && leaf.alternate.type === 'IfStatement') {
          leaf = leaf.alternate
        }
        const condition = getCondition(attrs, variables, filters, translations, languages)
        leaf.alternate = {
          type: 'IfStatement',
          test: condition,
          consequent: {
            type: 'BlockStatement',
            body: ast.body
          },
          depth
        }
      }
    } else if (tag === 'else') {
      let leaf = tree.last(`IfStatement[depth="${depth}"]`)
      if (leaf) {
        const ast = new AbstractSyntaxTree('')
        collectChildren(fragment, ast)
        while (leaf.alternate && leaf.alternate.type === 'IfStatement') {
          leaf = leaf.alternate
        }
        leaf.alternate = {
          type: 'BlockStatement',
          body: ast.body
        }
      }
    } else if (tag === 'for') {
      forTag({ fragment, tree, attrs, variables, translations, languages, collectChildren })
    } else if (tag === 'slot' || tag === 'yield') {
      const ast = new AbstractSyntaxTree('')
      collectChildren(fragment, ast)
      ast.body.forEach(node => tree.append(node))
    } else if (tag === 'try') {
      tryTag({ fragment, tree, options, collectChildren })
    } else if (tag === 'catch') {
      catchTag({ fragment, tree, collectChildren })
    } else if (tag === 'unless') {
      unlessTag({ fragment, tree, attrs, variables, depth, collectChildren })
    } else if (tag === 'elseunless') {
      elseunlessTag({ fragment, tree, attrs, variables, depth, collectChildren })
    } else if (tag === 'switch') {
      switchTag({ tree, attrs })
    } else if (tag === 'case') {
      caseTag({ fragment, tree, attrs, variables, collectChildren })
    } else if (tag === 'default') {
      let leaf = tree.last('SwitchStatement')
      if (leaf) {
        const ast = new AbstractSyntaxTree('')
        collectChildren(fragment, ast)
        ast.append({
          type: 'BreakStatement',
          label: null
        })
        leaf.cases.push({
          type: 'SwitchCase',
          consequent: ast.body,
          test: null
        })
      }
    } else if (tag === 'foreach' || tag === 'each') {
      foreachTag({ fragment, tree, variables, attrs, collectChildren })
    } else if (isImportTag(tag)) {
      collectComponentsFromImport(fragment, components, null, assets, options)
    } else if (tag === 'partial' || tag === 'render' || tag === 'include') {
      collectComponentsFromPartialOrRender(fragment, assets, null, plugins, errors, options)
    } else if (tag === 'markdown') {
      markdownTag({ fragment, tree })
    } else if (tag === 'font') {
      fontTag({ fragment, tree, options })
    }
    depth -= 1
  } catch (exception) {
    errors.push(exception)
  }
}

module.exports = collect
