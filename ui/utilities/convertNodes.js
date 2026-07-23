const { Input } = require("../..")
const { resolveAttributes } = require("./parseCustomTag")
const { replaceVariables } = require("./replaceVariables")
const { format } = require("./format")
const { slugify } = require("./slugify")
const { restoreCodeSegments } = require("../prose/utilities/protectCode")

const HEADING_TYPES = new Set(["h1", "h2", "h3", "h4", "h5", "h6"])

/**
 * Strip inline markdown syntax so anchor slugs come from the visible text,
 * e.g. "## [Link](https://x.com)" -> slug "link"
 */
function stripInlineMarkdown(text) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
}

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

    // Task list items get a disabled checkbox: - [x] done
    if (item.task) {
      const checkbox = { type: "checkbox", disabled: true }
      if (item.checked) {
        checkbox.checked = true
      }
      content.unshift(Input(checkbox), " ")
    }

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
 * Converts a table item into table/thead/tbody nodes
 * Column alignment renders as an inline text-align style
 */
function processTable(item, htmlParams, data, allComponents) {
  const cellParams = (index) => {
    const align = item.aligns[index]
    return align ? { ...htmlParams, style: { textAlign: align } } : htmlParams
  }
  const cellContent = (cell) =>
    format(replaceVariables(cell, data), allComponents)

  const head = allComponents.thead(
    htmlParams,
    allComponents.tr(
      htmlParams,
      item.header.map((cell, index) =>
        allComponents.th(cellParams(index), cellContent(cell)),
      ),
    ),
  )
  const body = allComponents.tbody(
    htmlParams,
    item.rows.map((row) =>
      allComponents.tr(
        htmlParams,
        row.map((cell, index) =>
          allComponents.td(cellParams(index), cellContent(cell)),
        ),
      ),
    ),
  )

  return allComponents.table(htmlParams, [head, body])
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
  // Anchor slugs used so far - repeated headings get -2, -3 suffixes
  const slugs = new Map()
  // Masked-code tokens from Prose - restored in anchor slug sources so
  // "## Title with `code`" slugs from the real code text, not the mask
  const codeTokens = params && params.__codeTokens
  // Heading anchors are opt-in - Prose enables them, plain Markdown stays a
  // faithful GFM renderer with untouched headings
  const headingAnchors = params && params.__headingAnchors
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
    } else if (item.type === "table") {
      result.push(processTable(item, htmlParams, data, allComponents))
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
      let elementParams = htmlParams

      // Headings get an anchor id derived from their text,
      // e.g. "## Mój tytuł" -> <h2 id="moj-tytul">
      if (headingAnchors && HEADING_TYPES.has(type) && !htmlParams.id) {
        // Tokens can chain across nested Prose calls (an inner call masks
        // the outer call's token again) - restore until stable
        let slugSource = processedContent
        if (codeTokens) {
          let previous
          do {
            previous = slugSource
            slugSource = restoreCodeSegments(slugSource, codeTokens)
          } while (slugSource !== previous)
        }
        const slug = slugify(stripInlineMarkdown(slugSource))
        if (slug) {
          const count = slugs.get(slug) || 0
          slugs.set(slug, count + 1)
          const id = count === 0 ? slug : `${slug}-${count + 1}`
          elementParams = { ...htmlParams, id }
        }
      }

      result.push(
        Component(elementParams, format(processedContent, allComponents)),
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
  processTable,
  convertItemsToNodes,
}
