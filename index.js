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
