'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { getLiteral } = require('./ast')
const { getTemplateAssignmentExpression, getObjectMemberExpression } = require('./factory')
const { convertText, convertTag } = require('./convert')
const walk = require('himalaya-walk')
const { SPECIAL_TAGS, SELF_CLOSING_TAGS } = require('./enum')
const { join, dirname } = require('path')
const { parse } = require('./html')
const { inlineLocalVariables, inlineExpressions } = require('./inline')
const { clone } = require('./object')
const { isImportTag } = require('./string')
const { optimize } = require('./optimize')
const tags = require('../tags')
const { hasShorthandSyntax, normalizeAttributes } = require('./node')
const { getComponentNames } = require('./attributes')
const { findAsset } = require('./files')

function collectComponentsFromImport (fragment, components, context, assets, options) {
  const attrs = fragment.attributes
  const names = getComponentNames(attrs)
  if (names.length === 1) {
    const name = names[0]
    if (!hasShorthandSyntax(fragment)) {
      const path = attrs[1].value
      collectComponent(name, path, components, context, assets, options)
    } else {
      const lastAttribute = attrs[attrs.length - 1]
      const dir = lastAttribute.value
      const path = join(dir, `${name}.html`)
      collectComponent(name, path, components, context, assets, options)
    }
  } else {
    const lastAttribute = attrs[attrs.length - 1]
    const dir = lastAttribute.value
    names.forEach(name => {
      const path = join(dir, `${name}.html`)
      collectComponent(name, path, components, context, assets, options)
    })
  }
}

function collectComponent (name, path, components, context, assets, options) {
  let paths = [].concat(options.paths)
  if (context) {
    paths = paths.concat(dirname(context))
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
  collectComponentFromPath(path, fragment, assets, context, plugins, errors, options)
}

function collectComponentsFromPartialAttribute (fragment, assets, context, plugins, errors, options) {
  const attr = fragment.attributes.find(attr => attr.key === 'partial')
  if (!attr) { return null }
  const path = attr.value
  collectComponentFromPath(path, fragment, assets, context, plugins, errors, options)
  fragment.attributes = []
}

function collectComponentFromPath (path, fragment, assets, context, plugins, errors, options) {
  let paths = [].concat(options.paths)
  if (context) {
    paths = [dirname(context)].concat(paths)
  }
  const asset = findAsset(path, assets, { paths, aliases: options.aliases })
  if (!asset) return
  resolveComponent(asset.source, asset.path, null, fragment, [], plugins, errors, assets, options)
}

function inlineData (htmlTree, content, path, assets, plugins, errors, localVariables, options) {
  walk(htmlTree, leaf => {
    leaf.context = path
    inlineLocalVariables(leaf, localVariables)
  })
  walk(htmlTree, leaf => {
    inlineExpressions(leaf, localVariables)
  })
  runPlugins(htmlTree, content, plugins, assets, errors, options)
  return htmlTree
}

function collectInlineComponents (fragment, attributes, components) {
  const { key } = attributes[attributes.length - 1]
  const { content } = fragment.children[0]
  components.push({ name: key, files: ['.'], content, path: null })
  fragment.children.forEach(child => {
    child.used = true
  })
}

function isSlotOrYield (node) {
  return node.tagName === 'slot' || node.tagName === 'yield'
}

function resolveComponent (content, path, component, fragment, queue, plugins, errors, assets, options) {
  const localVariables = normalizeAttributes(fragment.attributes)
  let htmlTree = parse(optimize(content, localVariables))
  htmlTree = inlineData(htmlTree, content, path, assets, plugins, errors, localVariables, options)
  walk(htmlTree, current => {
    if (component) { current.imported = true }
  })
  const currentComponents = []
  let slots = 0
  let children = fragment.children
  walk(htmlTree, async (current) => {
    const attrs = current.attributes || []
    const keys = attrs.map(attr => attr.key)
    if (isImportTag(current.tagName)) {
      collectComponentsFromImport(current, currentComponents, path, assets, options)
    } else if (current.tagName === 'partial' || current.tagName === 'render' || current.tagName === 'include') {
      collectComponentsFromPartialOrRender(current, assets, path, plugins, errors, options)
    } else if (current.attributes && current.attributes[0] && current.attributes[0].key === 'partial') {
      collectComponentsFromPartialAttribute(current, assets, path, plugins, errors, options)
    } else if (current.tagName === 'template' && keys.length > 0) {
      collectInlineComponents(current, attrs, currentComponents)
    }
    const currentComponent = currentComponents.find(component => component.name === current.tagName)
    const unresolvable = component && current.tagName === component.name && !currentComponent
    if (unresolvable) { current.unresolvable = true }
    if (currentComponent && !current.unresolvable) {
      queue.push(children)
      resolveComponent(currentComponent.content, currentComponent.path, currentComponent, current, queue, plugins, errors, assets, options)
      current.used = true
    }
    if (isSlotOrYield(current) && current.children.length === 0 && !current.yielded) {
      if (current.attributes.length === 0) {
        // putting a slot into a slot is problematic
        if (children.length === 1 && children[0].tagName === 'slot') {
          children = children[0].children
        }
        walk(children, leaf => {
          leaf.yielded = true
          if (isSlotOrYield(leaf)) {
            leaf.children = queue.pop()
          }
        })
        if (slots === 0) {
          current.children = children
        } else {
          current.children = clone(children)
        }
        slots += 1
      } else {
        const name = current.attributes[0].key
        walk(children, leaf => {
          if (isSlotOrYield(leaf) && leaf.attributes.length > 0 && leaf.attributes[0].key === name) {
            // the following might not be super performant in case of components with multiple slots
            // we could do this only if a slot with given name is not unique (e.g. in if / else statements)
            // TODO handle deeply nested named slots with queue.pop()
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
  if (component) { fragment.tagName = 'slot' }
  return { fragment, localVariables }
}

async function collect ({ source, tree, fragment, assets, variables, filters, components, styles, translations, plugins, store, depth, options, promises, errors, warnings }) {
  function collectChildren (fragment, ast) {
    walk(fragment, async current => {
      await collect({ source, tree: ast, fragment: current, assets, variables, filters, components, styles, translations, plugins, store, depth, options, promises, errors, warnings })
    })
  }
  function append (node) {
    tree.append(getTemplateAssignmentExpression(options.variables.template, node))
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
      const { localVariables } = resolveComponent(component.content, component.path, component, fragment, [], plugins, errors, assets, options)
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
        enter: (node, parent) => {
          if (node.type === 'Identifier' && !node.inlined && !node.omit && parent.type !== 'VariableDeclarator') {
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
    } else if (tag === 'template' && keys.length > 0) {
      collectInlineComponents(fragment, attrs, components)
    } else if (tag === 'link' && (keys.includes('inline') || options.inline.includes('stylesheets'))) {
      const { value: path } = attrs.find(attr => attr.key === 'href')
      const asset = findAsset(path, assets, options)
      if (!asset) return
      styles.push(asset.source.trim())
    } else if (tag === 'style') {
      tags.style({ fragment, styles })
    } else if (tag === 'script') {
      tags.script({ tree, fragment, keys, attrs, assets, variables, promises, warnings, filters, translations, languages, append, options })
    } else if (tag === 'template') {
      tags.template({ tree, fragment, options })
    } else if (tag === 'data') {
      tags.data({ tree, fragment })
    } else if (tag === '!doctype') {
      tags.doctype({ tree, options })
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
        append(node)
      })
      collectChildren(fragment, tree)
      if (!SELF_CLOSING_TAGS.includes(tag)) {
        const attr = fragment.attributes.find(attr => attr.key === 'tag' || attr.key === 'tag|bind')
        if (attr) {
          const property = attr.key === 'tag' ? attr.value.substring(1, attr.value.length - 1) : attr.value
          append(getLiteral('</'))
          append(getObjectMemberExpression(property))
          append(getLiteral('>'))
        } else {
          append(getLiteral(`</${tag}>`))
        }
      }
    } else if (fragment.type === 'text') {
      const nodes = convertText(fragment.content, variables, filters, translations, languages, false, options.compact)
      return nodes.forEach(node => append(node))
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
    } else if (tag === 'var') {
      tags.var({ tree, attrs, variables })
    }
    depth -= 1
  } catch (exception) {
    errors.push(exception)
  }
}

module.exports = collect
