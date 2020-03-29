'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const Bundler = require('../Bundler')
const { getLiteral } = require('../utilities/ast')
const { getTemplateAssignmentExpression } = require('../utilities/factory')
const { getScopeProperties } = require('../utilities/scope')
const { findAsset } = require('../utilities/files')
const { isCurlyTag } = require('../utilities/string')
const { convertAttribute } = require('../utilities/convert')
let asyncCounter = 0

module.exports = async function ({ tree, keys, attrs, fragment, assets, variables, promises, warnings, filters, translations, languages, append, options }) {
  if (keys.includes('inline') || options.inline.includes('scripts')) {
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
  } else if (keys.includes('polyfills')) {
    let content = '<script>'
    const { value } = attrs.find(attr => attr.key === 'polyfills')
    const ast = new AbstractSyntaxTree(value)
    const polyfills = AbstractSyntaxTree.serialize(ast.body[0].expression)
    polyfills.forEach(polyfill => {
      const asset = findAsset(polyfill, assets, options)
      if (asset) {
        content += asset.source
      } else {
        warnings.push({ type: 'POLYFILL_NOT_FOUND', message: `${polyfill} polyfill not found` })
      }
    })
    fragment.children.forEach(node => {
      node.used = true
      content += node.content
    })
    content += '</script>'
    tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral(content)))
  } else if (keys.includes('scoped')) {
    const leaf = fragment.children[0]
    if (!leaf) return
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
        parent.body.splice(index + 0, 0, getTemplateAssignmentExpression(options.variables.template, getLiteral(`\n${result}</script>`)))
      }
    })
  } else if (keys.includes('compiler')) {
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
        tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral(`<script>${result}</script>`)))
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
            parent.body.splice(index + 0, 0, getTemplateAssignmentExpression(options.variables.template, getLiteral(`<script>${source}</script>`)))
          }
        })
      }
    }
  } else {
    append(getLiteral('<script'))
    fragment.attributes.forEach(attribute => {
      if (isCurlyTag(attribute.value)) {
        append(getLiteral(` ${attribute.key}="`))
        append(convertAttribute(attribute.key, attribute.value, variables, filters, translations, languages))
        append(getLiteral('"'))
      } else if (attribute.value) {
        append(getLiteral(` ${attribute.key}="${attribute.value}"`))
      } else {
        append(getLiteral(` ${attribute.key}`))
      }
    })
    append(getLiteral('>'))
    fragment.children.forEach(node => {
      node.used = true
      append(getLiteral(node.content))
    })
    append(getLiteral('</script>'))
  }
}
