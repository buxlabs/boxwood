async function compile (path) {
  const template = require(path)
  return {
    template
  }
}

const ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
}

const REGEXP = /[&<>'"]/g

const escape = (string) => {
  return String.prototype.replace.call(string, REGEXP, function (character) {
    return ENTITIES[character]
  })
}

const div = (content) => {
  return "<div>" + content + "</div>"
}

module.exports = {
  compile,
  escape,
  div
}
