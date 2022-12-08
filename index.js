async function compile (path) {
  const fn = require(path)
  return {
    template (data) {
      const tree = fn(data)
      const nodes = {}
      const styles = []
      walk(tree, node => {
        if (node.name === 'head') {
          nodes.head = node
        }
        if (node.name === 'style') {
          styles.push(node.children)
          node.ignore = true
        }
      })
      if (nodes.head && styles.length > 0) {
        nodes.head.children.push({
          name: 'style',
          children: styles.join('')
        })
      }
      return render(tree)
    }
  }
}

function walk (tree, callback) {
  callback(tree)
  if (Array.isArray(tree.children)) {
    tree.children.map(node => walk(node, callback))
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

const BOOLEAN_ATTRIBUTES = [
  'async',
  'autofocus',
  'autoplay',
  'border',
  'challenge',
  'checked',
  'compact',
  'contenteditable',
  'controls',
  'default',
  'defer',
  'disabled',
  'formnovalidate',
  'frameborder',
  'hidden',
  'indeterminate',
  'ismap',
  'loop',
  'multiple',
  'muted',
  'nohref',
  'noresize',
  'noshade',
  'novalidate',
  'nowrap',
  'open',
  'readonly',
  'required',
  'reversed',
  'scoped',
  'scrolling',
  'seamless',
  'selected',
  'sortable',
  'spellcheck',
  'translate'
]

const attributes = (options) => {
  const result = []
  for (const key in options) {
    if (BOOLEAN_ATTRIBUTES.includes(key)) {
      result.push(key)
    } else {
      result.push(key + '=' + '"' + options[key] + '"')
    }
  }
  return result.join(' ')
}

const SELF_CLOSING_TAGS = [
  'area', 'base', 'br', 'col', 'command',
  'embed', 'hr', 'img', 'input', 'keygen', 'link',
  'meta', 'param', 'source', 'track', 'wbr', '!DOCTYPE html'
]

const render = (input) => {
  if (input.ignore) { return '' }
  if (Array.isArray(input)) { return input.filter(Boolean).map(render).join('') }
  if (typeof input === 'number') { return input.toString() }
  if (typeof input === 'string') { return escape(input) }
  if (input.name === 'fragment') {
    return render(input.children)
  }
  if (SELF_CLOSING_TAGS.includes(input.name)) {
    if (input.attributes) {
      return `<${input.name} ` + attributes(input.attributes) + '>'
    }
    return `<${input.name}>`
  }
  if (input.attributes && input.children) {
    return `<${input.name} ` + attributes(input.attributes) + '>' + render(input.children) + `</${input.name}>`
  }
  if (input.attributes) {
    return `<${input.name} ` + attributes(input.attributes) + `></${input.name}>`
  }
  if (input.children) {
    return `<${input.name}>` + render(input.children) + `</${input.name}>`
  }
  return `<${input.name}></${input.name}>`
}

const fragment = (children) => {
  return { name: 'fragment', children }
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
  if (SELF_CLOSING_TAGS.includes(name)) {
    return {
      name,
      attributes: children
    }
  }
  return {
    name,
    children
  }
}

const { parse, stringify } = require('css')
const toHash = require('string-hash')

function css (values) {
  const input = values[0]
  const hash = toHash(input).toString(36).substr(0, 5)
  const tree = parse(input)
  const { rules } = tree.stylesheet
  const classes = {}
  rules.forEach(rule => {
    rule.selectors = rule.selectors.map(selector => {
      if (selector.startsWith('.')) {
        if (selector.includes(':')) {
          const [input, pseudoselector] = selector.substr(1).split(':')
          const output = `__${input}__${hash}`
          classes[input] = output
          return `.${output}:${pseudoselector}`
        } else {
          const input = selector.substr(1)
          const output = `__${input}__${hash}`
          classes[input] = output
          return `.${output}`
        }
      }
      return selector
    })
  })
  return {
    classes,
    styles: stringify(tree, { compress: true })
  }
}

const node = (name) => (options, children) => tag(name, options, children)

const html = node('html')
const head = node('head')
const body = node('body')
const div = node('div')
const span = node('span')
const style = node('style')
const input = node('input')
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
const doctype = node('!DOCTYPE html')
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
  input,
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
  p,
  css
}
