const { join } = require("path")
const { readFileSync } = require("fs")
const csstree = require("css-tree")

function compile(path) {
  const fn = require(path)
  return {
    template() {
      const tree = fn(...arguments)
      const nodes = {}
      const styles = []
      const scripts = {
        head: [],
        body: [],
      }
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
          const attributes = node.attributes || {}
          if (
            attributes.src ||
            ["application/json", "application/ld+json"].includes(
              attributes.type
            )
          ) {
            node.ignore = false
            return
          } else {
            const script = node.children
            if (script) {
              if (attributes.target === "head") {
                if (!scripts.head.includes(script)) {
                  scripts.head.push(script)
                }
              } else {
                if (!scripts.body.includes(script)) {
                  scripts.body.push(script)
                }
              }
            }
            node.ignore = true
          }
        }
        if (Array.isArray(node)) {
          node.forEach(walk)
        } else if (Array.isArray(node.children)) {
          node.children.forEach(walk)
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
        if (scripts.head.length > 0) {
          nodes.head.children.push({
            name: "script",
            children: scripts.head.join(""),
          })
        }
      }
      if (nodes.body) {
        if (scripts.body.length > 0) {
          nodes.body.children.push({
            name: "script",
            children: scripts.body.join(""),
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

function readFile(path, encoding) {
  try {
    return readFileSync(path, encoding)
  } catch (exception) {
    throw new Error(
      `FileError: cannot read file "${path}": ${exception.message}`
    )
  }
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
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      value === true ||
      Array.isArray(value)
    ) {
      if (BOOLEAN_ATTRIBUTES.includes(key)) {
        result.push(key)
      } else {
        const name = ALIASES[key] || key
        const value = options[key]
        const content = Array.isArray(value) ? classes(...value) : value
        result.push(name + "=" + '"' + escapeHTML(content) + '"')
      }
    } else if (key === "style" && typeof value === "object") {
      const styles = []
      for (const param in value) {
        const result = value[param]
        if (result) {
          styles.push(`${decamelize(param)}:${escapeHTML(result)}`)
        }
      }
      if (styles.length > 0) {
        result.push(`style="${styles.join(";")}"`)
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
  if (
    typeof input === "undefined" ||
    typeof input === "boolean" ||
    input === null ||
    input.ignore
  ) {
    return ""
  }
  if (typeof input === "number") {
    return input.toString()
  }
  if (typeof input === "string") {
    if (escape) {
      return escapeHTML(input)
    }
    return input
  }
  if (Array.isArray(input)) {
    return input.map((input) => render(input)).join("")
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

  return (
    `<${input.name}` +
    (input.attributes ? " " + attributes(input.attributes) : "") +
    ">" +
    render(input.children, isUnescapedTag(input.name)) +
    `</${input.name}>`
  )
}

const raw = (children) => {
  return { name: "raw", children }
}

raw.load = function () {
  const path = join(...arguments)
  const content = readFile(path, "utf8")
  return raw(content)
}

const tag = (a, b, c) => {
  if (typeof b === "string" || typeof b === "number" || Array.isArray(b)) {
    const name = a
    const children = b
    return {
      name,
      children: children,
    }
  }
  const name = a
  const attributes = b
  const children = c || []
  return {
    name,
    children,
    attributes,
  }
}

let number = 1
function sequence() {
  return number++
}

function decamelize(string) {
  return string.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
}

function stylesheet(input) {
  const object = { ...input }
  return {
    add(item) {
      for (const key in item) {
        object[key] = item[key]
      }
    },
    set(key, value) {
      object[key] = value
    },
    toString() {
      let result = []
      for (const key in object) {
        const value = object[key]
        if (value) {
          result.push(`${decamelize(key)}:${value}`)
        }
      }
      return result.join(";")
    },
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
  const hash = sequence()
  const tree = csstree.parse(result)
  const classes = {}

  csstree.walk(tree, (node) => {
    if (node.type === "ClassSelector") {
      const name = `${node.name}_${hash}`
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
  const content = readFile(file, "utf8")
  return css`
    ${content}
  `
}

css.create = function (object) {
  return stylesheet(object)
}

css.inline = function (object) {
  return stylesheet(object).toString()
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
  const parts = []
  for (const param of arguments) {
    if (typeof param === "string") {
      parts.push(param)
    }
  }
  const path = join(...parts)
  const file = path.endsWith(".js") ? path : join(path, "index.js")
  const content = readFile(file, "utf8")

  const options = arguments[arguments.length - 1]
  const attributes = options.target ? { target: options.target } : {}
  if (options && options.transform) {
    return {
      js: tag("script", attributes, options.transform(content)),
    }
  }
  return { js: tag("script", attributes, content) }
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

function extension(path) {
  const parts = path.split(".")
  return parts[parts.length - 1].toLowerCase()
}

function media(path) {
  const type = extension(path)
  if (type === "svg") {
    return "image/svg+xml"
  }
  return `image/${type === "jpg" ? "jpeg" : type}`
}

function base64({ content, path }) {
  return `data:${media(path)};base64,${content}`
}

const ALLOWED_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "svg"]

nodes.img.load = function () {
  const path = join(...arguments)
  const type = extension(path)
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(type)) {
    throw new Error(
      `ImageError: unsupported image type "${type}" for path "${path}"`
    )
  }
  const content = readFile(path, "base64")
  return (options) => {
    return nodes.img({ src: base64({ content, path }), ...options })
  }
}

nodes.svg.load = function () {
  const path = join(...arguments)
  const content = readFile(path, "utf8")
  return raw(content)
}

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
    } else if (Array.isArray(arg)) {
      array.push(classes(...arg))
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

const json = {
  load() {
    const path = join(...arguments)
    const file = path.endsWith(".json") ? path : join(path, "index.json")
    const content = readFile(file, "utf8")
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
  const data = json.load(path)
  return function translate(language, key) {
    if (!language) {
      throw new Error(`TranslationError: language is undefined`)
    }
    if (!key) {
      throw new Error(`TranslationError: key is undefined`)
    }
    if (!data[key] || !data[key][language]) {
      throw new Error(
        `TranslationError: translation [${key}][${language}] is undefined`
      )
    }
    return data[key][language]
  }
}

function component(fn, { styles, i18n, scripts } = {}) {
  function execute(a, b) {
    if (typeof a === "string" || typeof a === "number" || Array.isArray(a)) {
      return fn({}, a)
    }
    if (i18n) {
      if (!a || !a.language) {
        throw new Error(
          `TranslationError: language is undefined for component:\n${fn.toString()}`
        )
      }
      const { language } = a
      function translate(key) {
        if (!key) {
          throw new Error(
            `TranslationError: key is undefined for component:\n${fn.toString()}`
          )
        }
        if (!i18n[key] || !i18n[key][language]) {
          throw new Error(
            `TranslationError: translation [${key}][${language}] is undefined for component:\n${fn.toString()}`
          )
        }
        const translation = i18n[key][language]
        return translation
      }
      return fn({ ...a, translate }, b || [])
    }
    return fn(a, b || [])
  }
  return function (a, b) {
    const tree = execute(a, b)
    let nodes = Array.isArray(tree) ? tree : [tree]

    if (styles) {
      const data = Array.isArray(styles) ? styles : [styles]
      nodes = nodes.concat(data.map((style) => style.css))
    }

    if (scripts) {
      const data = Array.isArray(scripts) ? scripts : [scripts]
      nodes = nodes.concat(data.map((script) => script.js))
    }

    return nodes
  }
}

module.exports = {
  compile,
  component,
  classes,
  doctype,
  escape: escapeHTML,
  raw,
  css,
  js,
  json,
  tag,
  i18n,
  ...nodes,
}
