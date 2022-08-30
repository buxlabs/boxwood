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
  return '<div>' + content + '</div>'
}

const span = (options, content) => {
  return "<span class='" + options.class + "'>" + content + '</span>'
}

const h1 = (content) => {
  return '<h1>' + content + '</h1>'
}

const h2 = (content) => {
  return '<h2>' + content + '</h2>'
}

const ul = (children) => {
  return '<ul>' + children.join('') + '</ul>'
}

const li = (content) => {
  return '<li>' + content + '</li>'
}

module.exports = {
  compile,
  escape,
  div,
  span,
  h1,
  h2,
  ul,
  li
}
