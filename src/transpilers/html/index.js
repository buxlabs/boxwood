'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { camelize } = require('pure-utilities/string')
const { deduceParams } = require('./expression')
const BoxModelPlugin = require('../../plugins/BoxModelPlugin')
const CurlyStylesPlugin = require('../../plugins/CurlyStylesPlugin')
const { parse, walk } = require('../../utilities/html')
const { findAttributeByKey } = require('../../utilities/attributes')
const { transpileNode } = require('./node')
// TODO: initial transpilation, move to a separate dir? or inline here after removing the outdated compiler
const Transpiler = require('../../compilers/html/Transpiler')

const {
  ArrayExpression,
  Identifier,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportSpecifier,
  Literal
} = AbstractSyntaxTree

function pathToIdentifier (path) {
  return `__${camelize(path).replace('.', 'Dot')}__`
}

const program = (body) => {
  const params = deduceParams(body)
  return AbstractSyntaxTree.program(
    AbstractSyntaxTree.template(`
      export default function (%= params %) {
        return <%= body %>
      }
    `, { params, body })
  )
}

function createComponentImportDeclarations (imports) {
  return imports.map(node => {
    const { path } = node
    return new ImportDeclaration({
      specifiers: [
        new ImportDefaultSpecifier({
          local: new Identifier(pathToIdentifier(path))
        })
      ],
      source: new Literal(path)
    })
  })
}

function deducePartials (tree) {
  return tree.find('Identifier[partial=true]')
}

function createPartialImportDeclarations (imports) {
  return imports.map(node => {
    const { name, path } = node
    return new ImportDeclaration({
      specifiers: [
        new ImportDefaultSpecifier({
          local: new Identifier(name)
        })
      ],
      source: new Literal(path)
    })
  })
}

function deduceComponents (htmlTree) {
  const nodes = []
  walk(htmlTree, node => {
    if (node.tagName === 'import') {
      nodes.push({
        tag: node.attributes[0].key,
        path: findAttributeByKey(node.attributes, 'from').value
      })
    }
  })
  return nodes
}

function deduceBoxwoodImports (tree) {
  const methods = ['tag', 'escape']
  const imports = []
  methods.forEach(method => {
    if (tree.has(`CallExpression[callee.name="${method}"]`)) {
      imports.push(method)
    }
  })
  return imports
}

function createBoxwoodImportDeclaration (imports) {
  return new ImportDeclaration({
    specifiers: imports.map(name => (new ImportSpecifier({
      local: new Identifier(name),
      imported: new Identifier(name)
    }))),
    source: new Literal('boxwood')
  })
}

function prerunPlugins (tree, plugins) {
  plugins.forEach(plugin => plugin.beforeprerun())
  walk(tree, node => {
    plugins.forEach(plugin => {
      plugin.prerun({
        tag: node.tagName,
        keys: node.attributes ? node.attributes.map(attribute => attribute.key) : [],
        attrs: node.attributes || [],
        fragment: node
      })
    })
  })
  plugins.forEach(plugin => plugin.afterprerun())
}

function body (tree, options) {
  const plugins = [
    // new RoutesPlugin(options, errors),
    // new DataPlugin(),
    // new InlinePlugin(),
    new BoxModelPlugin(options),
    new CurlyStylesPlugin()
    // new ScopedStylesPlugin(),
    // new SwappedStylesPlugin(),
    // new InternationalizationPlugin({ translations, filters, errors })
  ]
  prerunPlugins(tree, plugins)
  return tree.length === 1
    ? transpileNode({ node: tree[0], parent: tree, index: 0 })
    : new ArrayExpression(
      tree
        .map((node, index) => transpileNode({ node, parent: tree, index }))
        .filter(Boolean)
    )
}

function transpile (source, options) {
  source = new Transpiler().transpile(source)

  const tree = parse(source)
  const outputTree = new AbstractSyntaxTree(
    program(body(tree, options))
  )

  let imports

  imports = deduceComponents(tree)
  if (imports.length > 0) {
    outputTree.prepend(createComponentImportDeclarations(imports))

    outputTree.replace(node => {
      if (node.type === 'CallExpression' && node.callee.name === 'tag') {
        imports.forEach(leaf => {
          if (node.arguments[0].value === leaf.tag) {
            node.callee.name = pathToIdentifier(leaf.path)
            node.arguments.shift()
          }
        })
      }
    })
  }

  // console.log(outputTree.source)

  imports = deducePartials(outputTree)
  if (imports.length > 0) {
    outputTree.prepend(createPartialImportDeclarations(imports))
  }

  imports = deduceBoxwoodImports(outputTree)
  if (imports.length > 0) {
    outputTree.prepend(createBoxwoodImportDeclaration(imports))
  }

  const block = outputTree.first('ExportDefaultDeclaration > FunctionDeclaration > BlockStatement')
  const statement = block.body.find(node => node.type === 'ReturnStatement')
  if (statement.argument.type === 'ArrayExpression') {
    statement.argument.elements = statement.argument.elements.filter(element => {
      if (element.type === 'Literal' && element.value === null) {
        return false
      }
      return true
    })
    if (statement.argument.elements.length === 1) {
      statement.argument = statement.argument.elements[0]
    }
  }
  return outputTree.source
}

module.exports = { transpile }
