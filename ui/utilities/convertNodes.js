const { resolveAttributes } = require("./parseCustomTag")
const { replaceVariables } = require("./replaceVariables")
const { format } = require("./format")

/**
 * Recursively parses nested lists with proper indentation handling
 */
function parseList(
  items,
  startIndex,
  parentIndent,
  htmlParams,
  data,
  allComponents,
) {
  const list = []
  let currentIndex = startIndex
  const parentListType = items[startIndex].list

  while (currentIndex < items.length) {
    const item = items[currentIndex]

    // Stop conditions
    if (item.type !== "li" || item.indent < parentIndent) {
      break
    }

    if (item.indent === parentIndent && item.list !== parentListType) {
      break
    }

    if (item.indent > parentIndent) {
      break
    }

    // Process current list item
    const processedContent = replaceVariables(item.content, data)
    const content = [format(processedContent, allComponents)]
    currentIndex++

    // Check for nested lists
    const nextItem = items[currentIndex]
    if (nextItem?.type === "li" && nextItem.indent > item.indent) {
      const nestedResult = parseList(
        items,
        currentIndex,
        nextItem.indent,
        htmlParams,
        data,
        allComponents,
      )
      content.push(nestedResult.list)
      currentIndex = nestedResult.nextIndex
    }

    list.push(allComponents.li(htmlParams, content))
  }

  const listElement =
    parentListType === "ul"
      ? allComponents.ul(htmlParams, list)
      : allComponents.ol(htmlParams, list)

  return { list: listElement, nextIndex: currentIndex }
}

/**
 * Processes a custom component item into a node
 */
function processCustomComponentItem(item, params, data, markdownRenderer) {
  const resolvedAttrs = resolveAttributes(item.attributes, data)

  if (item.selfClosing) {
    return item.component(resolvedAttrs)
  }

  if (item.singleLine) {
    return item.component(resolvedAttrs, item.content)
  }

  // Multi-line component with children - recursively process markdown
  const childContent = item.content
    ? markdownRenderer(params, item.content)
    : []
  return item.component(resolvedAttrs, childContent)
}

/**
 * Processes blockquote items into a single blockquote node
 */
function processBlockquotes(
  items,
  startIndex,
  htmlParams,
  data,
  allComponents,
) {
  const lines = []
  let i = startIndex

  while (i < items.length && items[i].type === "blockquote") {
    lines.push(items[i].content)
    i++
  }

  const content = replaceVariables(lines.join("\n"), data)
  const blockquote = allComponents.blockquote(
    htmlParams,
    allComponents.p(htmlParams, format(content, allComponents)),
  )

  return { node: blockquote, nextIndex: i }
}

/**
 * Converts parsed items into final node tree
 */
function convertItemsToNodes(
  items,
  params,
  htmlParams,
  data,
  allComponents,
  markdownRenderer,
) {
  const result = []
  let i = 0

  while (i < items.length) {
    const item = items[i]

    if (item.type === "custom-component") {
      result.push(
        processCustomComponentItem(item, params, data, markdownRenderer),
      )
      i++
    } else if (item.type === "li") {
      const listResult = parseList(
        items,
        i,
        item.indent,
        htmlParams,
        data,
        allComponents,
      )
      result.push(listResult.list)
      i = listResult.nextIndex
    } else if (item.type === "blockquote") {
      const { node, nextIndex } = processBlockquotes(
        items,
        i,
        htmlParams,
        data,
        allComponents,
      )
      result.push(node)
      i = nextIndex
    } else if (item.type === "hr") {
      result.push(allComponents.hr(htmlParams))
      i++
    } else if (item.type === "pre") {
      // Code blocks - wrap in <pre><code>
      const codeParams = item.language
        ? { class: `language-${item.language}` }
        : {}
      result.push(
        allComponents.pre(
          htmlParams,
          allComponents.code(codeParams, item.content),
        ),
      )
      i++
    } else {
      // Regular block elements (h1-h6, p, etc.)
      const { type, content } = item
      const Component = allComponents[type] || allComponents.p
      const processedContent = replaceVariables(content, data)
      result.push(
        Component(htmlParams, format(processedContent, allComponents)),
      )
      i++
    }
  }

  return result
}

module.exports = {
  parseList,
  processCustomComponentItem,
  processBlockquotes,
  convertItemsToNodes,
}
