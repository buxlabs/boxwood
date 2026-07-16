// Author comments: {!-- note to self --} never renders
// Comments can span multiple lines and are removed before any other
// templating pass, so their content is never interpolated or executed
const COMMENT_REGEXP = /\{!--[\s\S]*?--\}/g

/**
 * Remove {!-- ... --} author comments from text
 * An unclosed comment is left as-is (the validator reports it)
 * @param {string} text - Text possibly containing comments
 * @returns {string} - Text without comments
 */
function stripComments(text) {
  if (!text || typeof text !== "string") {
    return text
  }
  return text.replace(COMMENT_REGEXP, "")
}

module.exports = { stripComments, COMMENT_REGEXP }
