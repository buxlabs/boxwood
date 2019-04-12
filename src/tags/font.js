const { getLiteral, getTemplateAssignmentExpression } = require('../factory')

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
  const name = fragment.attributes[0].key
  const path = fragment.attributes[fragment.attributes.length - 1].value
  tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral(`<style>${getFontFaceDeclaration(name, path)}</style>`)))
}
