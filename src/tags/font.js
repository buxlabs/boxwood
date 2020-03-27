'use strict'

const { getLiteral } = require('../utilities/ast')
const { getTemplateAssignmentExpression } = require('../utilities/factory')

function getExtension (path) {
  const parts = path.split('.')
  return parts[parts.length - 1]
}

function deduceFormat (extension) {
  if (extension === 'ttf') return 'truetype'
  return extension
}

function getFontFaceDeclaration (name, path) {
  const extension = getExtension(path)
  const format = deduceFormat(extension)
  return `@font-face { font-family: "${name}"; src: local("${name}"), url(${path}) format("${format}"); }`
}

module.exports = function ({ fragment, tree, options }) {
  const basePath = fragment.attributes.find(attribute => attribute.key === 'from').value
  const leftBracketIndex = fragment.attributes.findIndex(attribute => attribute.key === '{')
  const rightBracketIndex = fragment.attributes.findIndex(attribute => attribute.key === '}')
  if (leftBracketIndex !== -1 && rightBracketIndex !== -1) {
    const names = fragment.attributes.slice(leftBracketIndex + 1, rightBracketIndex).map(attribute => attribute.key.replace(',', ''))
    const extension = fragment.attributes.find(attribute => attribute.key === 'extension').value
    names.forEach(name => {
      const path = basePath.concat(`/${name}.${extension}`)
      tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral(`<style>${getFontFaceDeclaration(name, path)}</style>`)))
    })
  } else {
    const name = fragment.attributes[0].key
    tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral(`<style>${getFontFaceDeclaration(name, basePath)}</style>`)))
  }
}
