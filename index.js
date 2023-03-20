const { join } = require("path")
const { readFileSync } = require("fs")
const csstree = require("css-tree")
const toHash = require("string-hash")
const YAML = require("yaml")

async function compile(path) {
  const fn = require(path)
  return {
    template() {
      const tree = fn(...arguments)
      const nodes = {}
      const styles = []
      const scripts = []
      const walk = (node) => {
        if (!node) {
          return
        }
        if (node.name === "head") {
          nodes.head = node
        }
        if (node.name === "body") {
          nodes.body = node
        }
        if (node.name === "style") {
          const css = node.children
          if (!styles.includes(css)) {
            styles.push(css)
          }
          node.ignore = true
        }
        if (node.name === "script") {
          const js = node.children
          if (!scripts.includes(js)) {
            scripts.push(js)
          }
          node.ignore = true
        }
        if (Array.isArray(node)) {
          node.forEach(walk)
        } else if (Array.isArray(node.children)) {
          node.children.filter(Boolean).forEach(walk)
        }
      }
      walk(tree)
      if (nodes.head) {
        if (styles.length > 0) {
          nodes.head.children.push({
            name: "style",
            children: styles.join(""),
          })
        }
      }
      if (nodes.body) {
        if (scripts.length > 0) {
          nodes.body.children.push({
            name: "script",
            children: scripts.join(""),
          })
        }
      }
      return render(tree)
    },
  }
}

const ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
}

const REGEXP = /[&<>'"]/g

const escapeHTML = (string) => {
  return String.prototype.replace.call(string, REGEXP, function (character) {
    return ENTITIES[character]
  })
}

const BOOLEAN_ATTRIBUTES = [
  "async",
  "autofocus",
  "autoplay",
  "border",
  "challenge",
  "checked",
  "compact",
  "contenteditable",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "frameborder",
  "hidden",
  "indeterminate",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nohref",
  "noresize",
  "noshade",
  "novalidate",
  "nowrap",
  "open",
  "readonly",
  "required",
  "reversed",
  "scoped",
  "scrolling",
  "seamless",
  "selected",
  "sortable",
  "spellcheck",
  "translate",
]

const ALIASES = {
  className: "class",
  htmlFor: "for",
}

const attributes = (options) => {
  const result = []
  for (const key in options) {
    const value = options[key]
    if (value) {
      if (BOOLEAN_ATTRIBUTES.includes(key)) {
        result.push(key)
      } else {
        const name = ALIASES[key] || key
        const value = options[key]
        const content = Array.isArray(value) ? classes(...value) : value
        result.push(name + "=" + '"' + content + '"')
      }
    }
  }
  return result.join(" ")
}

const SELF_CLOSING_TAGS = [
  "area",
  "base",
  "br",
  "col",
  "command",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
  "!DOCTYPE html",
]

const isUnescapedTag = (name) => {
  return !["script", "style", "template"].includes(name)
}

const render = (input, escape = true) => {
  if (input.ignore) {
    return ""
  }
  if (Array.isArray(input)) {
    return input.filter(Boolean).map(render).join("")
  }
  if (typeof input === "number") {
    return input.toString()
  }
  if (typeof input === "string") {
    return escape ? escapeHTML(input) : input
  }
  if (input.name === "fragment") {
    return render(input.children)
  }
  if (input.name === "raw") {
    return render(input.children, false)
  }
  if (SELF_CLOSING_TAGS.includes(input.name)) {
    if (input.attributes) {
      return `<${input.name} ` + attributes(input.attributes) + ">"
    }
    return `<${input.name}>`
  }
  if (input.attributes && input.children) {
    return (
      `<${input.name} ` +
      attributes(input.attributes) +
      ">" +
      render(input.children, isUnescapedTag(input.name)) +
      `</${input.name}>`
    )
  }
  if (input.attributes) {
    return (
      `<${input.name} ` + attributes(input.attributes) + `></${input.name}>`
    )
  }
  if (input.children) {
    return (
      `<${input.name}>` +
      render(input.children, isUnescapedTag(input.name)) +
      `</${input.name}>`
    )
  }
  return `<${input.name}></${input.name}>`
}

const fragment = (children) => {
  return { name: "fragment", children }
}

const raw = (children) => {
  return { name: "raw", children }
}

raw.load = function () {
  const path = join(...arguments)
  const content = readFileSync(path, "utf8")
  return raw(content)
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

function css(inputs) {
  let result = ""
  for (let i = 0, ilen = inputs.length; i < ilen; i += 1) {
    const input = inputs[i]
    const value = arguments[i + 1]
    if (value) {
      result += input + value
    } else {
      result += input
    }
  }
  const hash = toHash(result).toString(36).substr(0, 5)
  const tree = csstree.parse(result)
  const classes = {}

  csstree.walk(tree, (node) => {
    if (node.type === "ClassSelector") {
      const name = `__${node.name}__${hash}`
      classes[node.name] = name
      node.name = name
    }
  })

  return {
    ...classes,
    css: tag("style", csstree.generate(tree)),
  }
}

css.load = function () {
  const path = join(...arguments)
  const file = path.endsWith(".css") ? path : join(path, "index.css")
  const content = readFileSync(file, "utf8")
  return css`
    ${content}
  `
}

function js(inputs) {
  let result = ""
  for (let i = 0, ilen = inputs.length; i < ilen; i += 1) {
    const input = inputs[i]
    const value = arguments[i + 1]
    if (value) {
      result += input + value
    } else {
      result += input
    }
  }
  return {
    js: tag("script", result),
  }
}

js.load = function () {
  const path = join(...arguments)
  const file = path.endsWith(".js") ? path : join(path, "index.js")
  const content = readFileSync(file, "utf8")
  return js`${content}`
}

const node = (name) => (options, children) => tag(name, options, children)
const doctype = node("!DOCTYPE html")

const nodes = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "svg",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
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
    if (type === "string") {
      array.push(arg)
    } else if (type === "object") {
      for (const key in arg) {
        if (arg[key]) {
          array.push(key)
        }
      }
    }
  }
  return array.join(" ")
}

const yaml = {
  load() {
    const path = join(...arguments)
    const file = path.endsWith(".yaml") ? path : join(path, "index.yaml")
    const content = readFileSync(path, "utf8")
    return YAML.parse(content)
  },
}

const json = {
  load() {
    const path = join(...arguments)
    const file = path.endsWith(".json") ? path : join(path, "index.json")
    const content = readFileSync(file, "utf8")
    return JSON.parse(content)
  },
}

function i18n(translations) {
  return function translate(language, key) {
    return translations[key][language]
  }
}

i18n.load = function () {
  const path = join(...arguments)
  const data = path.endsWith(".yaml") ? yaml.load(path) : json.load(path)
  return function translate(language, key) {
    return data[key][language]
  }
}

function component(fn, { styles, i18n } = {}) {
  function execute(a, b) {
    if (typeof a === "string" || Array.isArray(a)) {
      return fn({}, a)
    }
    if (i18n) {
      function translate(key) {
        return i18n[key][a.language]
      }
      return fn({ ...a, translate }, b || [])
    }
    return fn(a, b || [])
  }
  return function (a, b) {
    const tree = execute(a, b)
    if (styles) {
      if (Array.isArray(tree)) {
        return tree.concat(styles.css)
      }
      return [tree, styles.css]
    }
    return tree
  }
}

module.exports = {
  compile,
  component,
  classes,
  doctype,
  escape: escapeHTML,
  fragment,
  raw,
  css,
  js,
  yaml,
  json,
  tag,
  i18n,
  ...nodes,
}
