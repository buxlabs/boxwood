const nodes = require("../..")
const { component } = nodes

const { extractHtmlParams, mergeComponents } = require("./utilities/params")
const { parseMarkdownLines } = require("./utilities/parseBlock")
const { convertItemsToNodes } = require("./utilities/convertNodes")

const ORDERED_LIST_REGEXP = /^\d+\.\s/
const UNORDERED_MARKERS = ["- ", "— ", "– ", "• "]
const HORIZONTAL_RULE_REGEXP = /^(?:\*\s*\*\s*\*+|-\s*-\s*-+|_\s*_\s*_+)\s*$/
const HEADINGS = [
  { prefix: "###### ", type: "h6" },
  { prefix: "##### ", type: "h5" },
  { prefix: "#### ", type: "h4" },
  { prefix: "### ", type: "h3" },
  { prefix: "## ", type: "h2" },
  { prefix: "# ", type: "h1" },
]

const COMPONENTS = {
  h1: nodes.H1,
  h2: nodes.H2,
  h3: nodes.H3,
  h4: nodes.H4,
  h5: nodes.H5,
  h6: nodes.H6,
  blockquote: nodes.Blockquote,
  hr: nodes.Hr,
}

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

function Markdown(params, children) {
  // Handle array of children recursively
  if (Array.isArray(children)) {
    return children.map((child) => Markdown(params, child))
  }

  // Only process string content
  if (typeof children !== "string") {
    return null
  }

  const customComponents = params && params.components
  const data = params && params.data
  const allComponents = mergeComponents(BUILTIN_HTML_TAGS, customComponents)
  const htmlParams = extractHtmlParams(params)

  // Parse all markdown lines into structured items
  const items = parseMarkdownLines(
    children,
    allComponents,
    data,
    {
      orderedListRegexp: ORDERED_LIST_REGEXP,
      unorderedMarkers: UNORDERED_MARKERS,
      horizontalRuleRegexp: HORIZONTAL_RULE_REGEXP,
      headings: HEADINGS,
    },
  )

  // Convert parsed items into final node tree
  return convertItemsToNodes(
    items,
    params,
    htmlParams,
    data,
    allComponents,
    COMPONENTS,
    Markdown,
  )
}

module.exports = component(Markdown)
