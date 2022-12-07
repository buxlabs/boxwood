async function compile (path) {
  const fn = require(path)
  return {
    template (data) {
      const tree = fn(data)
      return render(tree)
    }
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

const attributes = (options) => {
  const result = []
  for (const key in options) {
    result.push(key + '=' + '"' + options[key] + '"')
  }
  return result.join(' ')
}

const SELF_CLOSING_TAGS = [
  'area', 'base', 'br', 'col', 'command',
  'embed', 'hr', 'img', 'input', 'keygen', 'link',
  'meta', 'param', 'source', 'track', 'wbr', '!doctype html'
]

const render = (input) => {
  if (Array.isArray(input)) { return input.map(render).join('') }
  if (typeof input === 'number') { return input.toString() }
  if (typeof input === 'string') { return input }
  if (SELF_CLOSING_TAGS.includes(input.name)) {
    if (input.attributes) {
      return `<${input.name} ` + attributes(input.attributes) + '>'
    }
    return `<${input.name}>`
  }
  if (input.attributes && input.children) {
    if (Array.isArray(input.children)) {
      return `<${input.name} ` + attributes(input.attributes) + '>' + input.children.map(render).join('') + `</${input.name}>`
    }
    return `<${input.name} ` + attributes(input.attributes) + '>' + render(input.children) + `</${input.name}>`
  }
  if (input.attributes) {
    return `<${input.name} ` + attributes(input.attributes) + `></${input.name}>`
  }
  if (input.children) {
    if (Array.isArray(input.children)) {
      return `<${input.name}>` + input.children.map(render).join('') + `</${input.name}>`
    }
    return `<${input.name}>` + render(input.children) + `</${input.name}>`
  }
  return `<${input.name}></${input.name}>`
}

const fragment = (children) => {
  return render(children)
}

const tag = (a, b, c) => {
  if (a && b && c) {
    const name = a
    const attributes = b
    const children = c
    return {
      name,
      children,
      attributes
    }
  }
  const name = a
  const children = b
  return {
    name,
    children
  }
}

const node = (name) => (options, children) => tag(name, options, children)

const html = node('html')
const head = node('head')
const body = node('body')
const div = node('div')
const span = node('span')
const style = node('style')
const h1 = node('h1')
const h2 = node('h2')
const h3 = node('h3')
const h4 = node('h4')
const h5 = node('h5')
const h6 = node('h6')
const ul = node('ul')
const li = node('li')
const button = node('button')
const title = node('title')
const a = node('a')
const p = node('p')
const doctype = node('!doctype html')
const img = node('img')
const meta = node('meta')

module.exports = {
  compile,
  doctype,
  html,
  head,
  title,
  body,
  escape,
  fragment,
  div,
  span,
  style,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  ul,
  li,
  button,
  img,
  meta,
  a,
  p
}
