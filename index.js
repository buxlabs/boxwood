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

const render = (children) => {
  if (Array.isArray(children)) { return children.join('') }
  return children
}

const attributes = (options) => {
  return 'class=' + options.class
}

const tag = (a, b, c) => {
  if (a && b && c) {
    const name = a
    const options = b
    const children = c
    return '<' + name + ' ' + attributes(options) + '>' + render(children) + '</' + name + '>'
  }
  const name = a
  const children = b
  return '<' + name + '>' + render(children) + '</' + name + '>'
}

const div = (options, children) => {
  return tag('div', options, children)
}

const span = (options, children) => {
  return tag('span', options, children)
}

const h1 = (options, children) => {
  return tag('h1', options, children)
}

const h2 = (options, children) => {
  return tag('h2', options, children)
}

const ul = (options, children) => {
  return tag('ul', options, children)
}

const li = (options, children) => {
  return tag('li', options, children)
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
