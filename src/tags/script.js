'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const Bundler = require('../Bundler')
const { getLiteral } = require('../utilities/ast')
const { getScopeProperties } = require('../utilities/scope')
const { findAsset } = require('../utilities/files')
const { containsCurlyTag } = require('../utilities/string')
const { convertAttribute } = require('../utilities/convert')
let scopeCounter = 0

module.exports = async function ({ tree, keys, attrs, fragment, assets, variables, promises, warnings, filters, translations, languages, append, scripts, options }) {
  if (keys.includes('inline') || options.inline.includes('scripts')) {
    if (keys.includes('src')) {
      const { value: path } = attrs.find(attr => attr.key === 'src')
      const asset = findAsset(path, assets, options)
      if (!asset) return
      const content = asset.source.trim()
      scripts.push(content)
    } else {
      const leaf = fragment.children[0]
      leaf.used = true
      const ast = new AbstractSyntaxTree(leaf.content)
      ast.each('VariableDeclarator', node => variables.push(node.id.name))
      ast.body.forEach(node => tree.append(node))
    }
  } else if (keys.includes('polyfills')) {
    let content = ''
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
    scripts.push(content)
  } else if (keys.includes('scoped')) {
    const leaf = fragment.children[0]
    if (!leaf) return
    const scope = new AbstractSyntaxTree(leaf.content)
    const properties = getScopeProperties(scope)
    leaf.used = true
    const script = []
    let scopeName = ''
    if (properties.length > 0) {
      scopeCounter++
      scopeName = `__scope_${scopeCounter}__`
      script.push(getLiteral(`const ${scopeName} = `))
      script.push({
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
      })
      script.push(getLiteral(';'))
    }
    const bundler = new Bundler()
    const promise = bundler.bundle(leaf.content, { paths: options.script.paths, resolve: options.script.resolve })
    promises.push(promise)
    const result = await promise
    let output = result
    if (scopeName) {
      const newTree = new AbstractSyntaxTree(result)
      newTree.walk(node => {
        // TODO do not replace scope inside of member expressions, e.g.
        // foo.scope
        // foo.bar.scope
        if (node.type === 'Identifier' && node.name === 'scope') {
          node.name = scopeName
        }
      })
      output = newTree.source
    }
    script.push(getLiteral(`\n${output}`))
    scripts.push(script)
  } else if (keys.includes('compiler')) {
    const { value } = attrs.find(attr => attr.key === 'compiler')
    const compiler = options.compilers[value]
    // TODO errors.push when given compiler is not available
    if (typeof compiler === 'function') {
      const attr = attrs.find(attr => attr.key === 'options')
      const params = attr && attr.value && JSON.parse(attr.value)
      const leaf = fragment.children[0]
      leaf.used = true
      const output = compiler(leaf.content, params)
      if (typeof output === 'string') {
        scripts.push(output)
      } else if (output instanceof Promise) {
        promises.push(output)
        const source = await output
        scripts.push(source)
      }
    }
  } else if (keys.includes('src')) {
    append(getLiteral('<script'))
    fragment.attributes.forEach(attribute => {
      if (containsCurlyTag(attribute.value)) {
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
  } else {
    fragment.children.forEach(node => {
      node.used = true
      const { content } = node
      scripts.push(content)
    })
  }
}
