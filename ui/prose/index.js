const nodes = require("../..")
const { component } = nodes

const Center = require("../center")
const Container = require("../container")
const Grid = require("../grid")
const Group = require("../group")
const Stack = require("../stack")

const { extractHtmlParams, mergeComponents } = require("../utilities/params")
const { parseMarkdownLines } = require("../utilities/parseBlock")
const { convertItemsToNodes } = require("../utilities/convertNodes")
const { processConditionals } = require("./utilities/processConditionals")
const { processLoops } = require("./utilities/processLoops")
const {
  maskCodeSegments,
  restoreCodeSegments,
} = require("./utilities/protectCode")
const { stripComments } = require("./utilities/stripComments")
const { validate } = require("./utilities/validate")

// Safe builtin HTML tags that can be used as custom components in markdown
// These are always available and don't need to be explicitly passed in params.components
const SAFE_TAG_NAMES = [
  // Containers
  "div",
  "span",
  // Semantic structure
  "article",
  "section",
  "header",
  "footer",
  "main",
  "aside",
  "nav",
  // Headings
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  // Text formatting
  "p",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "small",
  "mark",
  "sub",
  "sup",
  "br",
  "wbr",
  "abbr",
  "cite",
  "q",
  "kbd",
  "samp",
  "var",
  "del",
  "ins",
  "dfn",
  // Lists
  "ul",
  "ol",
  "li",
  "dl",
  "dt",
  "dd",
  // Links & media
  "a",
  "img",
  "picture",
  "source",
  // Code
  "code",
  "pre",
  // Tables
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "caption",
  "colgroup",
  "col",
  // Block elements
  "blockquote",
  "hr",
  // Figures
  "figure",
  "figcaption",
  // Interactive
  "details",
  "summary",
  // Other semantic
  "address",
  "time",
  "data",
]

// Build BUILTIN_HTML_TAGS dynamically from tag names
const BUILTIN_HTML_TAGS = SAFE_TAG_NAMES.reduce((acc, tagName) => {
  const componentName = tagName.charAt(0).toUpperCase() + tagName.slice(1)
  if (nodes[componentName]) {
    acc[tagName] = nodes[componentName]
  }
  return acc
}, {})

// Add built-in UI components
const BUILTIN_UI_COMPONENTS = {
  Center,
  Container,
  Grid,
  Group,
  Stack,
}

// Merge HTML tags and UI components
const BUILTIN_COMPONENTS = { ...BUILTIN_HTML_TAGS, ...BUILTIN_UI_COMPONENTS }

function Prose(params, children) {
  // Handle array of children recursively
  if (Array.isArray(children)) {
    return children.map((child) => Prose(params, child))
  }

  // Only process string content
  if (typeof children !== "string") {
    return null
  }

  const customComponents = params && params.components
  const data = params && params.data
  const allComponents = mergeComponents(BUILTIN_COMPONENTS, customComponents)
  const htmlParams = extractHtmlParams(params)

  // Mask code blocks and inline code first - code is literal content and
  // no templating pass (comments, loops, conditionals, interpolation) may touch it
  const { text: maskedChildren, tokens } = maskCodeSegments(children)

  // Inherit tokens from the outer Prose call (nested component content is
  // masked by the outer call) so heading anchors can restore code text
  const outerTokens = params && params.__codeTokens
  const codeTokens = outerTokens
    ? new Map([...outerTokens, ...tokens])
    : tokens

  // Remove {!-- ... --} author comments
  let processedChildren = stripComments(maskedChildren)

  // Process {#each}...{/each} loop blocks first
  // Conditionals within loops are processed during loop expansion
  processedChildren = processLoops(processedChildren, data)

  // Process any remaining {#if}...{/if} conditional blocks (those outside loops)
  processedChildren = processConditionals(processedChildren, data)

  // Parse all markdown lines into structured items
  const items = parseMarkdownLines(processedChildren, allComponents, data)

  // Convert parsed items into final node tree
  // __codeTokens travels with params so recursive Prose calls (multi-line
  // component children) can also restore code text in heading anchors
  // __headingAnchors opts into anchor ids - a Prose feature, not plain Markdown
  const nodes = convertItemsToNodes(
    items,
    { ...params, __codeTokens: codeTokens, __headingAnchors: true },
    htmlParams,
    data,
    allComponents,
    Prose,
  )

  // Put the original code content back into the final tree
  return restoreCodeSegments(nodes, tokens)
}

module.exports = component(Prose)

/**
 * Validate a Prose template without rendering it
 * Reports problems the renderer tolerates silently: unknown variables,
 * unclosed blocks, unsafe methods, unknown components
 * @param {string} text - The prose template text
 * @param {Object} options - { data, components } - both optional
 * @returns {Array<{line: number, type: string, message: string}>}
 */
module.exports.validate = (text, options = {}) => {
  return validate(text, {
    ...options,
    components: mergeComponents(BUILTIN_COMPONENTS, options.components),
  })
}
