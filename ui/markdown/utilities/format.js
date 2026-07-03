const { findMatchingBracket } = require("./brackets")

/**
 * Format inline markdown elements within text
 * Handles: images, links, code, bold, italic
 * @param {string} text - The text to format
 * @param {Object} allComponents - HTML component functions (contains a, img, code, strong, em, etc.)
 * @returns {Array|string} - Formatted content as array of components and strings
 */
function format(text, allComponents) {
  const { a: A, img: Img, code: Code, strong: Strong, em: Em } = allComponents

  if (
    !text.includes("*") &&
    !text.includes("`") &&
    !text.includes("[") &&
    !text.includes("!") &&
    !text.includes("<") &&
    !text.includes("\\")
  ) {
    return text
  }

  const result = []
  let i = 0

  while (i < text.length) {
    // Handle escape characters
    if (text[i] === "\\") {
      if (i + 1 < text.length) {
        const nextChar = text[i + 1]
        // Check if next char is a special markdown character
        if (
          nextChar === "*" ||
          nextChar === "`" ||
          nextChar === "[" ||
          nextChar === "]" ||
          nextChar === "(" ||
          nextChar === ")" ||
          nextChar === "!" ||
          nextChar === "<" ||
          nextChar === ">" ||
          nextChar === "\\"
        ) {
          // Escape the next character - just add it as literal text
          result.push(nextChar)
          i += 2 // Skip both \ and the escaped character
          continue
        }
        // If not a special char, keep both the backslash and the next character
        result.push(text[i])
        result.push(nextChar)
        i += 2
        continue
      } else {
        // Backslash at end of string
        result.push(text[i])
        i++
        continue
      }
    }
    
    if (text[i] === "!" && text[i + 1] === "[") {
      // Try to parse markdown image ![alt](url)
      const altEnd = text.indexOf("]", i + 2)

      if (altEnd !== -1 && text[altEnd + 1] === "(") {
        const urlEnd = text.indexOf(")", altEnd + 2)

        if (urlEnd !== -1) {
          const alt = text.substring(i + 2, altEnd)
          const src = text.substring(altEnd + 2, urlEnd)
          result.push(Img({ src, alt }))
          i = urlEnd + 1
          continue
        }
      }

      // Not a valid image, treat as regular text (skip both ! and [)
      result.push(text[i])
      i++
    } else if (text[i] === "[") {
      // Try to parse markdown link [text](url)
      const textEnd = findMatchingBracket(text, i)

      if (textEnd !== -1 && text[textEnd + 1] === "(") {
        const urlEnd = text.indexOf(")", textEnd + 2)

        if (urlEnd !== -1) {
          const linkText = text.substring(i + 1, textEnd)
          const url = text.substring(textEnd + 2, urlEnd)
          // Recursively format the link text to support images, bold, italic inside links
          result.push(A({ href: url }, format(linkText, allComponents)))
          i = urlEnd + 1
          continue
        }
      }

      // Not a valid link, treat as regular text
      result.push(text[i])
      i++
    } else if (text[i] === "<") {
      // Try to parse autolink <url> or <email>
      const end = text.indexOf(">", i + 1)
      
      if (end !== -1) {
        const content = text.substring(i + 1, end)
        
        // Check if it's a URL (starts with http:// or https://)
        if (content.startsWith("http://") || content.startsWith("https://")) {
          result.push(A({ href: content }, content))
          i = end + 1
          continue
        }
        
        // Check if it's an email (contains @ and looks like email)
        if (content.includes("@") && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content)) {
          result.push(A({ href: `mailto:${content}` }, content))
          i = end + 1
          continue
        }
      }
      
      // Not a valid autolink, treat as regular text
      result.push(text[i])
      i++
    } else if (text[i] === "`") {
      const end = text.indexOf("`", i + 1)
      if (end === -1) {
        result.push(text[i])
        i++
      } else {
        result.push(Code({}, text.substring(i + 1, end)))
        i = end + 1
      }
    } else if (text[i] === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2)
      if (end === -1) {
        result.push(text[i])
        i++
      } else {
        result.push(Strong(format(text.substring(i + 2, end), allComponents)))
        i = end + 2
      }
    } else if (text[i] === "*") {
      const end = text.indexOf("*", i + 1)
      if (end === -1) {
        result.push(text[i])
        i++
      } else {
        result.push(Em(format(text.substring(i + 1, end), allComponents)))
        i = end + 1
      }
    } else {
      // Find next special character
      const positions = [
        text.indexOf("`", i),
        text.indexOf("*", i),
        text.indexOf("[", i),
        text.indexOf("<", i),
        text.indexOf("\\", i),
      ].filter((pos) => pos !== -1)

      // Look for image pattern ![
      const exclamPos = text.indexOf("!", i)
      if (exclamPos !== -1 && text[exclamPos + 1] === "[") {
        positions.push(exclamPos)
      }

      const next = positions.length > 0 ? Math.min(...positions) : text.length

      result.push(text.substring(i, next))
      if (next === text.length) break
      i = next
    }
  }

  return result.length > 0 ? result : text
}

module.exports = { format }
