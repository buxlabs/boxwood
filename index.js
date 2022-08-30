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

const node = (name) => (options, children) => tag(name, options, children)

const div = node('div')
const span = node('span')
const h1 = node('h1')
const h2 = node('h2')
const ul = node('ul')
const li = node('li')

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
