const TAGS_TO_REPLACE_REGEXP = /["'&<>]/

function escape (input) {
  const string = '' + input
  const match = TAGS_TO_REPLACE_REGEXP.exec(string)

  if (!match) { return string }

  let text
  let html = ''
  let index = 0
  let lastIndex = 0

  for (index = match.index; index < string.length; index++) {
    switch (string.charCodeAt(index)) {
      case 34:
        text = '&quot;'
        break
      case 38:
        text = '&amp;'
        break
      case 39:
        text = '&#39;'
        break
      case 60:
        text = '&lt;'
        break
      case 62:
        text = '&gt;'
        break
      default:
        continue
    }

    if (lastIndex !== index) {
      html += string.substring(lastIndex, index)
    }

    lastIndex = index + 1
    html += text
  }

  return lastIndex !== index
    ? html + string.substring(lastIndex, index)
    : html
}

module.exports = escape
