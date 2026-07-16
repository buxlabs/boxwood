const {
  resolvePath,
  resolveExpression,
} = require("../../utilities/replaceVariables")
const { processConditionals } = require("./processConditionals")

// Upper bound for expanded loop output - {#each} blocks nested over large
// arrays multiply, and content authors should get a clear error instead of
// an unresponsive page
const MAX_EXPANSION_LENGTH = 1000000

/**
 * Process {#each items}...{/each} blocks in text
 * Repeats content for each item in an array
 * Supports:
 * - {#each items} - basic iteration, access current item with {item}
 * - {#each items as item} - custom item variable name
 * - {#each items as item, index} - access item and index
 * - {#each items}...{#else}...{/each} - fallback content for empty arrays
 * @param {string} text - Text containing loop blocks
 * @param {Object} data - Data object with variable values
 * @returns {string} - Text with loops expanded
 */
function processLoops(text, data) {
  if (!text || typeof text !== "string") {
    return text
  }

  // Without data every array is missing, so loops render their {#else} branch
  if (!data || typeof data !== "object") {
    data = {}
  }

  let result = text
  let maxIterations = 100 // Prevent infinite loops
  let iterations = 0

  // Process all {#each} blocks (handles nested blocks by processing innermost first)
  while (/{#each\s+[^}]+\}/.test(result) && iterations < maxIterations) {
    iterations++

    // Find the next {#each} block
    // Matches: {#each items}, {#each items as item}, {#each items as item, index}
    const eachMatch = result.match(
      /\{#each\s+([a-zA-Z0-9_.[\]]+)(?:\s+as\s+([a-zA-Z0-9_]+)(?:\s*,\s*([a-zA-Z0-9_]+))?)?\}/,
    )
    if (!eachMatch) break

    const fullEachTag = eachMatch[0]
    const arrayPath = eachMatch[1].trim()
    const itemName = eachMatch[2] ? eachMatch[2].trim() : "item"
    const indexName = eachMatch[3] ? eachMatch[3].trim() : null

    const eachStart = result.indexOf(fullEachTag)
    const contentStart = eachStart + fullEachTag.length

    // Find the matching {/each}
    let depth = 1
    let i = contentStart
    let endEachStart = -1

    while (i < result.length && depth > 0) {
      if (result.substring(i, i + 6) === "{#each") {
        depth++
        i += 6
      } else if (result.substring(i, i + 7) === "{/each}") {
        depth--
        if (depth === 0) {
          endEachStart = i
          break
        }
        i += 7
      } else {
        i++
      }
    }

    // If no matching {/each} found, break to avoid issues
    if (endEachStart === -1) {
      break
    }

    const blockContent = result.substring(contentStart, endEachStart)
    const endEachEnd = endEachStart + 7 // length of "{/each}"

    // Split the block into the item branch and an optional {#else} branch
    const { itemBranch, elseBranch } = splitLoopBranches(blockContent)

    // Resolve the array
    const array = resolvePath(data, arrayPath)

    // Generate repeated content
    let expandedContent = ""

    if (Array.isArray(array) && array.length > 0) {
      for (let idx = 0; idx < array.length; idx++) {
        const item = array[idx]

        // Create a new data context with the item and index
        const loopData = { ...data }
        loopData[itemName] = item

        if (indexName) {
          loopData[indexName] = idx
        }

        // First, expand nested loops recursively so they can reference
        // the current item (e.g. {#each group.members} inside {#each groups as group})
        let itemContent = processLoops(itemBranch, loopData)

        // Then process any conditionals within the loop content using the loop data
        itemContent = processConditionals(itemContent, loopData)

        // Then replace variables in the block content
        itemContent = replaceLoopVariables(itemContent, loopData)

        expandedContent += itemContent

        if (expandedContent.length > MAX_EXPANSION_LENGTH) {
          throw new Error(
            `Prose: {#each ${arrayPath}} expanded past ${MAX_EXPANSION_LENGTH} characters - reduce the array size or nesting`,
          )
        }
      }
    } else {
      // Empty or missing array - render the {#else} branch if present
      // It is inserted as-is: nested loops are handled by the next iterations
      // of this while loop, conditionals and variables by the later passes
      expandedContent = elseBranch
    }

    // Replace the entire {#each}...{/each} block
    result =
      result.substring(0, eachStart) +
      expandedContent +
      result.substring(endEachEnd)
  }

  return result
}

/**
 * Split loop block content into the item branch and an optional {#else} branch
 * Only a top-level {#else} splits the block - an {#else} that belongs to a
 * nested {#each} or {#if} inside the block is ignored
 * @param {string} blockContent - Content between {#each} and {/each}
 * @returns {{itemBranch: string, elseBranch: string}} - The two branches
 */
function splitLoopBranches(blockContent) {
  let depth = 0
  let i = 0

  while (i < blockContent.length) {
    if (
      blockContent.substring(i, i + 6) === "{#each" ||
      blockContent.substring(i, i + 4) === "{#if"
    ) {
      depth++
    } else if (
      blockContent.substring(i, i + 7) === "{/each}" ||
      blockContent.substring(i, i + 5) === "{/if}"
    ) {
      depth--
    } else if (depth === 0 && blockContent.substring(i, i + 7) === "{#else}") {
      return {
        itemBranch: blockContent.substring(0, i),
        elseBranch: blockContent.substring(i + 7),
      }
    }
    i++
  }

  return { itemBranch: blockContent, elseBranch: "" }
}

/**
 * Replace variables in text with values from loop data
 * @param {string} text - Text containing variable placeholders
 * @param {Object} loopData - Data object with loop variables
 * @returns {string} - Text with variables replaced
 */
function replaceLoopVariables(text, loopData) {
  if (!text || typeof text !== "string") {
    return text
  }

  let result = text
  const regex = /\{([^{}]+)\}/g
  let match

  // Collect all variable matches first to avoid issues with overlapping replacements
  const matches = []
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      fullMatch: match[0],
      path: match[1],
      index: match.index,
    })
  }

  // Process matches in reverse order to maintain correct indices
  for (let i = matches.length - 1; i >= 0; i--) {
    const { fullMatch, path, index } = matches[i]

    // Skip if it's a control structure tag
    if (
      path.startsWith("#") ||
      path.startsWith("/") ||
      fullMatch === "{#each}" ||
      fullMatch === "{/each}" ||
      fullMatch === "{#if}" ||
      fullMatch === "{/if}"
    ) {
      continue
    }

    // Resolve the expression (supports paths, safe method calls,
    // array literals and ?? fallbacks)
    const value = resolveExpression(loopData, path)

    if (value !== undefined && value !== null) {
      result =
        result.substring(0, index) +
        String(value) +
        result.substring(index + fullMatch.length)
    }
  }

  return result
}

module.exports = { processLoops }
