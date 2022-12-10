const csstree = require('css-tree')
const toHash = require('string-hash')

async function compile(path) {
  const fn = require(path)
  return {
    template() {
      const tree = fn(...arguments)
      const nodes = {}
      const styles = []
      const find = (node) => {
        if (node.name === 'head') {
          nodes.head = node
        }
        if (node.name === 'style') {
          styles.push(node.children)
          node.ignore = true
        }
        if (Array.isArray(node)) {
          node.forEach(find)
        }
      }
      walk(tree, find)
      if (nodes.head && styles.length > 0) {
        nodes.head.children.push({
          name: 'style',
          children: styles.join(''),
        })
      }
      return render(tree)
    },
  }
}

function walk(tree, callback) {
  callback(tree)
  if (Array.isArray(tree.children)) {
    tree.children.map((node) => walk(node, callback))
  }
}

const ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
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
  'translate',
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
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
  '!DOCTYPE html',
]

const render = (input) => {
  if (input.ignore) {
    return ''
  }
  if (Array.isArray(input)) {
    return input.filter(Boolean).map(render).join('')
  }
  if (typeof input === 'number') {
    return input.toString()
  }
  if (typeof input === 'string') {
    return escape(input)
  }
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
    return (
      `<${input.name} ` +
      attributes(input.attributes) +
      '>' +
      render(input.children) +
      `</${input.name}>`
    )
  }
  if (input.attributes) {
    return (
      `<${input.name} ` + attributes(input.attributes) + `></${input.name}>`
    )
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
      attributes,
    }
  }
  const name = a
  const children = b
  if (SELF_CLOSING_TAGS.includes(name)) {
    return {
      name,
      attributes: children,
    }
  }
  return {
    name,
    children,
  }
}

function css(values) {
  const input = values[0]
  const hash = toHash(input).toString(36).substr(0, 5)
  const tree = csstree.parse(input)
  const classes = {}

  csstree.walk(tree, (node) => {
    if (node.type === 'ClassSelector') {
      const name = `__${node.name}__${hash}`
      classes[node.name] = name
      node.name = name
    }
  })

  return {
    ...classes,
    css: tag('style', csstree.generate(tree)),
  }
}

const node = (name) => (options, children) => tag(name, options, children)
const doctype = node('!DOCTYPE html')

const nodes = [
  'a',
  'abbr',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'bdi',
  'bdo',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'col',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'meta',
  'meter',
  'nav',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'param',
  'picture',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'script',
  'section',
  'select',
  'small',
  'source',
  'span',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'svg',
  'table',
  'tbody',
  'td',
  'template',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'u',
  'ul',
  'var',
  'video',
  'wbr',
].reduce((result, name) => {
  result[name] = node(name)
  return result
}, {})

function classes() {
  const array = []
  for (let i = 0, ilen = arguments.length; i < ilen; i += 1) {
    const arg = arguments[i]
    if (!arg) {
      continue
    }
    const type = typeof arg
    if (type === 'string') {
      array.push(arg)
    } else if (type === 'object') {
      for (const key in arg) {
        if (arg[key]) {
          array.push(key)
        }
      }
    }
  }
  return array.join(' ')
}

module.exports = {
  compile,
  classes,
  doctype,
  escape,
  fragment,
  css,
  ...nodes,
}
