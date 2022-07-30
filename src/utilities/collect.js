'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { getLiteral } = require('./ast')
const { getTemplateAssignmentExpression } = require('./factory')
const { convertText, convertTag } = require('./convert')
const walk = require('himalaya-walk')
const { SPECIAL_TAGS, SELF_CLOSING_TAGS } = require('./enum')
const { join, dirname } = require('path')
const { parse } = require('./html')
const { inlineLocalVariables } = require('./inline')
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

function runPlugins (htmlTree, content, plugins, assets, errors, options, stack) {
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
          stack,
          errors,
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
          stack,
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

function collectComponentsFromPartialOrRender (fragment, assets, context, plugins, warnings, errors, options, variables, stack) {
  const path = fragment.attributes[0].value
  collectComponentFromPath(path, fragment, assets, context, plugins, warnings, errors, options, variables, stack)
}

function collectComponentsFromPartialAttribute (fragment, assets, context, plugins, warnings, errors, options, variables, stack) {
  const attr = fragment.attributes.find(attr => attr.key === 'partial')
  if (!attr) { return null }
  const path = attr.value
  collectComponentFromPath(path, fragment, assets, context, plugins, warnings, errors, options, variables, stack)
  fragment.attributes = []
}

function collectComponentFromPath (path, fragment, assets, context, plugins, warnings, errors, options, variables, stack) {
  let paths = [].concat(options.paths)
  if (context) {
    paths = [dirname(context)].concat(paths)
  }
  const asset = findAsset(path, assets, { paths, aliases: options.aliases })
  if (!asset) return
  stack.push(asset.path)
  resolveComponent(asset.source, asset.path, null, fragment, [], plugins, warnings, errors, assets, options, variables, stack)
  stack.pop()
}

function inlineData (htmlTree, content, path, assets, plugins, warnings, errors, localVariables, options, variables, stack) {
  walk(htmlTree, leaf => {
    leaf.context = path
    inlineLocalVariables(leaf, localVariables, variables, warnings)
  })
  runPlugins(htmlTree, content, plugins, assets, errors, options, stack)
  return htmlTree
}

function isSlotOrYield (node) {
  return node.tagName === 'slot' || node.tagName === 'yield'
}

function resolveComponent (content, path, component, fragment, queue, plugins, warnings, errors, assets, options, variables, stack) {
  const localVariables = normalizeAttributes(fragment.attributes)
  let htmlTree = parse(optimize(content, localVariables, warnings))
  let newVariablesCount = 0
  walk(htmlTree, current => {
    // TODO add foreach and other tags (data, var etc.)
    if (current.tagName === 'for') {
      if (current.attributes.length <= 3) {
        variables.push(current.attributes[0].key)
        newVariablesCount++
        if (current.attributes[2]) {
          variables.push(current.attributes[2].key)
          newVariablesCount++
        }
      } else if (current.attributes.length <= 5) {
        variables.push(current.attributes[0].key)
        newVariablesCount++
        variables.push(current.attributes[2].key)
        newVariablesCount++
        if (current.attributes[4]) {
          variables.push(current.attributes[4].key)
          newVariablesCount++
        }
      }
    }
  })
  htmlTree = inlineData(htmlTree, content, path, assets, plugins, warnings, errors, localVariables, options, variables, stack)
  walk(htmlTree, current => {
    if (component) { current.imported = true }
  })
  const currentComponents = []
  let slots = 0
  let children = fragment.children
  walk(htmlTree, async (current) => {
    if (isImportTag(current.tagName)) {
      collectComponentsFromImport(current, currentComponents, path, assets, options)
    } else if (current.tagName === 'partial' || current.tagName === 'render' || current.tagName === 'include') {
      collectComponentsFromPartialOrRender(current, assets, path, plugins, warnings, errors, options, variables, stack)
    } else if (current.attributes && current.attributes[0] && current.attributes[0].key === 'partial') {
      collectComponentsFromPartialAttribute(current, assets, path, plugins, warnings, errors, options, variables, stack)
    }
    const currentComponent = currentComponents.find(component => component.name === current.tagName)
    const unresolvable = component && current.tagName === component.name && !currentComponent
    if (unresolvable) { current.unresolvable = true }
    const isInContext = currentComponent && (currentComponent.files.includes(current.context))
    if (currentComponent && !current.unresolvable && isInContext) {
      queue.push(children)
      stack.push(currentComponent.path)
      resolveComponent(currentComponent.content, currentComponent.path, currentComponent, current, queue, plugins, warnings, errors, assets, options, variables, stack)
      stack.pop()
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
  while (newVariablesCount) {
    variables.pop()
    newVariablesCount--
  }
  return { fragment }
}

async function collect ({ source, tree, fragment, assets, variables, filters, components, scripts, styles, translations, plugins, stack, depth, options, promises, errors, warnings, needles }) {
  function collectChildren (fragment, ast) {
    walk(fragment, async current => {
      await collect({ source, tree: ast, fragment: current, assets, variables, filters, components, scripts, styles, translations, plugins, stack, depth, options, promises, errors, warnings, needles })
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
    const type = attrs ? attrs.find(attr => attr.key === 'type')?.value : null
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
        stack,
        ...fragment
      })
    })
    if (component && !fragment.imported) {
      stack.push(component.path)
      resolveComponent(component.content, component.path, component, fragment, [], plugins, warnings, errors, assets, options, variables, stack)
      stack.pop()
      const ast = new AbstractSyntaxTree('')
      collectChildren(fragment, ast)
      ast.body.forEach(node => tree.append(node))
    } else if (tag === 'translate') {
      tags.translate({ tree, fragment, attrs, options, filters, variables, translations, languages })
    } else if (tag === 'translation') {
      tags.translation({ tree, fragment, attrs, options, languages, stack, errors, collectChildren })
    } else if (tag === 'link' && (keys.includes('inline'))) {
      tags.link({ attrs, assets, options, styles })
    } else if (tag === 'style') {
      tags.style({ fragment, styles })
    } else if (tag === 'script' && !['application/json', 'application/ld+json'].includes(type)) {
      tags.script({ tree, fragment, keys, attrs, assets, variables, promises, warnings, filters, translations, languages, append, scripts, options })
    } else if (tag === 'template') {
      tags.template({ tree, fragment, options })
    } else if (tag === 'data') {
      tags.data({ fragment })
    } else if (tag === '!doctype') {
      tags.doctype({ tree, options })
    } else if (fragment.type === 'element' && !SPECIAL_TAGS.includes(tag)) {
      if (tag === 'img') {
        tags.img({ fragment, attrs, keys, assets, options })
      }
      collectComponentsFromPartialAttribute(fragment, assets, null, plugins, warnings, errors, options, variables, stack)
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
        if (tag === 'head' || tag === 'body') {
          const identifier = { type: 'Literal', value: `__NEEDLE_${tag.toUpperCase()}__` }
          needles[tag] = identifier
          append(identifier)
        }
        append(getLiteral(`</${tag}>`))
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
      collectComponentsFromPartialOrRender(fragment, assets, null, plugins, warnings, errors, options, variables, stack)
    } else if (tag === 'font') {
      tags.font({ fragment, tree, options })
    } else if (tag === 'var') {
      tags.var({ tree, attrs, variables })
    }
    depth -= 1
  } catch (exception) {
    errors.push(exception)
  }
}

module.exports = collect
