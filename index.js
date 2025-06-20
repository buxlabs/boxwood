const { join, resolve, sep: separator } = require("path")
const { readFileSync, realpathSync, lstatSync } = require("fs")
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

const normalizePath = (path) => path.replace(/\\/g, "/").replace(/\/+$/, "")

const ALLOWED_RAW_EXTENSIONS = ["html", "txt"]
const ALLOWED_CODE_EXTENSIONS = ["js", "css", "json"]
const ALLOWED_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "svg"]
const ALLOWED_READ_EXTENSIONS = [
  ...ALLOWED_RAW_EXTENSIONS,
  ...ALLOWED_IMAGE_EXTENSIONS,
  ...ALLOWED_CODE_EXTENSIONS,
]

function validateSymlinks(path, base) {
  let relative = path.slice(base.length + 1).split(separator)
  let current = base
  for (const part of relative) {
    if (!part) continue
    current = resolve(current, part)
    if (lstatSync(current).isSymbolicLink()) {
      throw new Error(`FileError: symlinks are not allowed ("${current}")`)
    }
  }
}

function validateFile(path, base) {
  const normalizedPath = normalizePath(path)
  const normalizedBase = normalizePath(base)

  const type = extension(normalizedPath)

  if (!type) {
    throw new Error(`FileError: path "${path}" has no extension`)
  }

  if (!ALLOWED_READ_EXTENSIONS.includes(type)) {
    throw new Error(
      `FileError: unsupported file type "${type}" for path "${path}"`
    )
  }

  const stats = lstatSync(normalizedPath)
  if (!stats.isFile()) {
    throw new Error(`FileError: path "${path}" is not a file`)
  }

  if (stats.isSymbolicLink()) {
    throw new Error(`FileError: path "${path}" is a symbolic link`)
  }

  if (normalizedPath === normalizedBase) {
    throw new Error(
      `FileError: path "${path}" is the same as the current working directory "${base}"`
    )
  }

  if (!normalizedPath.startsWith(normalizedBase + "/")) {
    throw new Error(
      `FileError: real path "${realPath}" is not within the current working directory "${realBase}"`
    )
  }
}

function readFile(path, encoding) {
  try {
    const base = process.cwd()
    const absoluteBase = resolve(base)
    const absolutePath = resolve(path)
    const realBase = realpathSync(absoluteBase)
    const realPath = realpathSync(absolutePath)

    validateSymlinks(realPath, realBase)
    validateFile(realPath, realBase)

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

const isKeyValid = (key) => /^[a-zA-Z0-9\-_]+$/.test(key)

const attributes = (options) => {
  if (!options) {
    return ""
  }
  const result = []
  for (const key in options) {
    if (!isKeyValid(key)) {
      continue
    }
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
        if (!isKeyValid(param)) {
          continue
        }
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

  const string = input.attributes ? attributes(input.attributes) : ""
  const attrs = string ? " " + string : ""

  return (
    `<${input.name}` +
    attrs +
    ">" +
    render(input.children, isUnescapedTag(input.name)) +
    `</${input.name}>`
  )
}

const raw = (children) => {
  return { name: "raw", children }
}

/**
 * Never trust HTML files from untrusted sources.
 *
 * This function is a basic sanitization of HTML content in case
 * you've accidentally included a "trusted", but malicious HTML file that was downloaded
 * from the internet or other untrusted sources.
 *
 * This function removes script and style tags, inline event handlers,
 * and any href attributes that use JavaScript. It does not
 * guarantee complete security, but it helps to mitigate some common
 * XSS attacks that can be embedded in HTML files.
 *
 * It is recommended to check all HTML files before using them
 * in your application.
 *
 * Never trust user-generated content.
 */

const sanitizeHTML = (content) => {
  return content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/(href|xlink:href)\s*=\s*(['"])javascript:[^'"]*\2/gi, "")
}

/*
 * Raw content is a special case where we want to allow
 * unescaped HTML content to be rendered directly.
 * This is useful for cases where we want to
 * include HTML fragments or templates that are
 * not meant to be escaped, like large blocks of HTML,
 * or when integrating with third-party libraries
 * that require raw HTML.
 *
 * Please note that this should be used with caution,
 * as it can lead to XSS vulnerabilities if the content
 * is not properly sanitized.
 *
 * It should only be used for trusted content
 * or in controlled environments.
 *
 * Should not be used for user-generated content.
 */

raw.load = function (path, options = {}) {
  const type = extension(path)
  if (!ALLOWED_RAW_EXTENSIONS.includes(type)) {
    throw new Error(
      `RawError: unsupported raw type "${type}" for path "${path}"`
    )
  }

  let content = readFile(path, "utf8")
  if (type === "html" && options.sanitize !== false) {
    content = sanitizeHTML(content)
  } else if (type === "txt" && options.escape !== false) {
    content = escapeHTML(content)
  }

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

function occurences(input, string) {
  if (string.length <= 0) {
    return input.length + 1
  }

  let count = 0
  let position = 0
  const step = string.length
  while (true) {
    position = input.indexOf(string, position)
    if (position >= 0) {
      count += 1
      position += step
    } else {
      break
    }
  }
  return count
}

const validateCSS = (content, character1, character2) => {
  const count1 = occurences(content, character1)
  const count2 = occurences(content, character2)
  if (count1 !== count2) {
    return {
      valid: false,
      message: `Mismatched count of ${character1} and ${character2}`,
    }
  }
  return { valid: true }
}

const CSS_PAIRS = [
  ["{", "}"],
  ["(", ")"],
  ["[", "]"],
]

function isCSSValid(content) {
  for (const [left, right] of CSS_PAIRS) {
    const { valid, message } = validateCSS(content, left, right)
    if (!valid) {
      return { valid, message: message }
    }
  }

  return { valid: true }
}

css.load = function (path) {
  const file = path.endsWith(".css") ? path : join(path, "index.css")
  const content = readFile(file, "utf8")
  const { valid, message } = isCSSValid(content)
  if (!valid) {
    throw new Error(`CSSError: invalid CSS for path "${file}": ${message}`)
  }
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

/*
 * Load a JavaScript file and return a script tag.
 *
 * Please note that this should be used with caution,
 * as it can lead to XSS vulnerabilities if the content
 * is not properly sanitized.
 *
 * It should only be used for trusted content
 * or in controlled environments.
 *
 * Should not be used for user-generated content.
 */

js.load = function (path, options = {}) {
  const file = path.endsWith(".js") ? path : join(path, "index.js")
  const content = readFile(file, "utf8")

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

nodes.img.load = function (path) {
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

/*
  Never trust SVG files from untrusted sources.
  This function is a basic sanitization of SVG content in case
  you've accidentally included a "trusted", but malicious SVG file that was downloaded
  from the internet or other untrusted sources.

  This function removes script and style tags, inline event handlers,
  and any href attributes that use JavaScript. It does not
  guarantee complete security, but it helps to mitigate some common
  XSS attacks that can be embedded in SVG files.

  It is recommended to check all SVG files before using them
  in your application.
*/
const sanitizeSVG = (content) => {
  return content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/(href|xlink:href)\s*=\s*(['"])javascript:[^'"]*\2/gi, "")
}

/*
 * SVG files are a special case where we want to allow
 * unescaped SVG content to be rendered directly.
 * This is useful for cases where we want to
 * include SVG fragments or templates that are
 * not meant to be escaped, like large blocks of SVG,
 * or when integrating with third-party libraries
 * that require raw SVG.
 *
 * Please note that this should be used with caution,
 * as it can lead to XSS vulnerabilities if the content
 * is not properly sanitized.
 *
 * It should only be used for trusted content
 * or in controlled environments.
 *
 * Should not be used for user-generated content.
 */

nodes.svg.load = function (path, options = {}) {
  const type = extension(path)
  if (type !== "svg") {
    throw new Error(
      `SVGError: unsupported SVG type "${type}" for path "${path}"`
    )
  }
  let content = readFile(path, "utf8")
  if (options.sanitize !== false) {
    content = sanitizeSVG(content)
  }

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
  load(path) {
    const file = path.endsWith(".json") ? path : join(path, "index.json")
    const content = readFile(file, "utf8")
    try {
      return JSON.parse(content)
    } catch (exception) {
      throw new Error(
        `JSONError: cannot parse file "${file}": ${exception.message}`
      )
    }
  },
}

function i18n(translations) {
  return function translate(language, key) {
    return translations[key][language]
  }
}

i18n.load = function (path, options = {}) {
  const data = json.load(path)
  if (options.sanitize !== false) {
    for (const key in data) {
      for (const lang in data[key]) {
        if (typeof data[key][lang] === "string") {
          data[key][lang] = sanitizeHTML(data[key][lang])
        }
      }
    }
  }

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
