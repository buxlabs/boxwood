// Internal params threaded through recursive calls - never HTML attributes
const INTERNAL_KEYS = new Set([
  "components",
  "data",
  "__codeTokens",
  "__headingAnchors",
])

/**
 * Extracts HTML parameters from params object by filtering out special keys
 */
function extractHtmlParams(params) {
  if (!params) return {}

  return Object.keys(params).reduce((acc, key) => {
    if (!INTERNAL_KEYS.has(key)) {
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
