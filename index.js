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
  if (Array.isArray(children)) { return children.filter(Boolean).join('') }
  if (typeof children === 'number') return children.toString()
  return escape(children)
}

const attributes = (options) => {
  const result = []
  for (const key in options) {
    result.push(key + '=' + '"' + options[key] + '"')
  }
  return result.join(' ')
}

const fragment = (children) => {
  return render(children)
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

const html = node('html')
const head = node('head')
const body = node('body')
const div = node('div')
const span = node('span')
const h1 = node('h1')
const h2 = node('h2')
const ul = node('ul')
const li = node('li')
const title = node('title')
const a = node('a')

const doctype = () => '<!DOCTYPE html>'
const img = (options) => '<img ' + attributes(options) + '>'
const meta = (options) => '<meta ' + attributes(options) + '>'

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
  h1,
  h2,
  ul,
  li,
  img,
  meta,
  a
}
