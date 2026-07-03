/**
 * Extracts HTML parameters from params object by filtering out special keys
 */
function extractHtmlParams(params) {
  if (!params) return {}

  return Object.keys(params).reduce((acc, key) => {
    if (key !== "components" && key !== "data") {
      acc[key] = params[key]
    }
    return acc
  }, {})
}

/**
 * Merges builtin HTML tags with custom components
 * Custom components can override builtin tags if needed
 */
function mergeComponents(builtinHtmlTags, customComponents) {
  return {
    ...builtinHtmlTags,
    ...customComponents,
  }
}

module.exports = {
  extractHtmlParams,
  mergeComponents,
}
