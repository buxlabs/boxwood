const nodes = require("../..")
const { component } = nodes

const { extractHtmlParams, mergeComponents } = require("./utilities/params")
const { parseMarkdownLines } = require("./utilities/parseBlock")
const { convertItemsToNodes } = require("./utilities/convertNodes")

// Basic HTML components needed for markdown formatting (links, images, code, etc.)
const BASIC_HTML_COMPONENTS = {
  h1: nodes.H1,
  h2: nodes.H2,
  h3: nodes.H3,
  h4: nodes.H4,
  h5: nodes.H5,
  h6: nodes.H6,
  a: nodes.A,
  img: nodes.Img,
  code: nodes.Code,
  strong: nodes.Strong,
  em: nodes.Em,
  p: nodes.P,
  ul: nodes.Ul,
  ol: nodes.Ol,
  li: nodes.Li,
  pre: nodes.Pre,
  blockquote: nodes.Blockquote,
  hr: nodes.Hr,
}

function Markdown(params, children) {
  // Handle array of children recursively
  if (Array.isArray(children)) {
    return children.map((child) => Markdown(params, child))
  }

  // Only process string content
  if (typeof children !== "string") {
    return null
  }

  const htmlParams = extractHtmlParams(params)
  
  // Merge basic HTML components - all components are now in one place
  const allComponents = mergeComponents(BASIC_HTML_COMPONENTS, null)

  // Parse all markdown lines into structured items (no custom components, no data)
  const items = parseMarkdownLines(children, null, null)

  // Convert parsed items into final node tree
  return convertItemsToNodes(
    items,
    params,
    htmlParams,
    null, // no data
    allComponents,
    Markdown,
  )
}

module.exports = component(Markdown)
