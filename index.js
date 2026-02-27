const { join, resolve, sep: separator } = require("path")
const { readFileSync, realpathSync, lstatSync } = require("fs")
const csstree = require("css-tree")
const { createHash } = require("./utilities/hash")

class TranslationError extends Error {
  constructor(message) {
    super(message)
    this.name = "TranslationError"
    Error.captureStackTrace(this, this.constructor)
  }
}

class FileError extends Error {
  constructor(message) {
    super(message)
    this.name = "FileError"
    Error.captureStackTrace(this, this.constructor)
  }
}

class RawError extends Error {
  constructor(message) {
    super(message)
    this.name = "RawError"
    Error.captureStackTrace(this, this.constructor)
  }
}

class CSSError extends Error {
  constructor(message) {
    super(message)
    this.name = "CSSError"
    Error.captureStackTrace(this, this.constructor)
  }
}

class ImageError extends Error {
  constructor(message) {
    super(message)
    this.name = "ImageError"
    Error.captureStackTrace(this, this.constructor)
  }
}

class SVGError extends Error {
  constructor(message) {
    super(message)
    this.name = "SVGError"
    Error.captureStackTrace(this, this.constructor)
  }
}

class JSONError extends Error {
  constructor(message) {
    super(message)
    this.name = "JSONError"
    Error.captureStackTrace(this, this.constructor)
  }
}

function compile(path) {
  const fn = require(path)
  return {
    template(options) {
      const nonce = options && options.nonce
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
              attributes.type,
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
          const styleNode = {
            name: "style",
            children: styles.join(""),
          }
          if (nonce) {
            styleNode.attributes = { nonce }
          }
          nodes.head.children.push(styleNode)
        }
        if (scripts.head.length > 0) {
          const scriptNode = {
            name: "script",
            children: scripts.head.join(""),
          }
          if (nonce) {
            scriptNode.attributes = { nonce }
          }
          nodes.head.children.push(scriptNode)
        }
      }
      if (nodes.body) {
        if (scripts.body.length > 0) {
          const scriptNode = {
            name: "script",
            children: scripts.body.join(""),
          }
          if (nonce) {
            scriptNode.attributes = { nonce }
          }
          nodes.body.children.push(scriptNode)
        }
      }
      return render(tree)
    },
  }
}

const escapeHTML = (string) => {
  // Convert to string to handle non-string inputs safely
  string = String(string)

  // Fast path: if no special characters, return as-is
  if (
    !string.includes("&") &&
    !string.includes("<") &&
    !string.includes(">") &&
    !string.includes("'") &&
    !string.includes('"')
  ) {
    return string
  }

  const len = string.length
  let result = ""
  let lastIndex = 0

  for (let i = 0; i < len; i++) {
    const char = string[i]
    let replacement

    switch (char) {
      case "&":
        replacement = "&amp;"
        break
      case "<":
        replacement = "&lt;"
        break
      case ">":
        replacement = "&gt;"
        break
      case "'":
        replacement = "&#39;"
        break
      case '"':
        replacement = "&quot;"
        break
      default:
        continue
    }

    if (lastIndex !== i) {
      result += string.slice(lastIndex, i)
    }
    result += replacement
    lastIndex = i + 1
  }

  if (lastIndex !== len) {
    result += string.slice(lastIndex)
  }

  return result
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
      throw new FileError(`symlinks are not allowed ("${current}")`)
    }
  }
}

function validateFile(path, base) {
  const normalizedPath = normalizePath(path)
  const normalizedBase = normalizePath(base)

  const type = extension(normalizedPath)

  if (!type) {
    throw new FileError(`path "${path}" has no extension`)
  }

  if (!ALLOWED_READ_EXTENSIONS.includes(type)) {
    throw new FileError(`unsupported file type "${type}" for path "${path}"`)
  }

  const stats = lstatSync(normalizedPath)
  if (!stats.isFile()) {
    throw new FileError(`path "${path}" is not a file`)
  }

  if (stats.isSymbolicLink()) {
    throw new FileError(`path "${path}" is a symbolic link`)
  }

  if (normalizedPath === normalizedBase) {
    throw new FileError(
      `path "${path}" is the same as the current working directory "${base}"`,
    )
  }

  if (!normalizedPath.startsWith(normalizedBase + "/")) {
    throw new FileError(
      `real path "${realPath}" is not within the current working directory "${realBase}"`,
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
    throw new FileError(`cannot read file "${path}": ${exception.message}`)
  }
}

const BOOLEAN_ATTRIBUTES = new Set([
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
])

const ALIASES = {
  className: "class",
  htmlFor: "for",
}

// Pre-compiled regex for better performance
const KEY_VALIDATION_REGEX = /^[a-zA-Z0-9\-_]+$/
const isKeyValid = (key) => KEY_VALIDATION_REGEX.test(key)

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
      if (BOOLEAN_ATTRIBUTES.has(key)) {
        result.push(key)
      } else {
        const name = ALIASES[key] || key
        const value = options[key]
        const content = Array.isArray(value) ? classes(...value) : value
        result.push(`${name}="${escapeHTML(content)}"`)
      }
    } else if (key === "style" && typeof value === "object") {
      const styles = []
      for (const param in value) {
        if (!isKeyValid(param)) {
          continue
        }
        const result = value[param]
        if (
          (param === "padding" || param === "margin") &&
          typeof result === "object"
        ) {
          const top = result.top || "0"
          const right = result.right || "0"
          const bottom = result.bottom || "0"
          const left = result.left || "0"
          styles.push(
            `${decamelize(param)}:${escapeHTML(
              `${top} ${right} ${bottom} ${left}`,
            )}`,
          )
        } else if (typeof result === "string" || typeof result === "number") {
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

const SELF_CLOSING_TAGS = new Set([
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
])

const UNESCAPED_TAGS = new Set(["script", "style", "template"])

const render = (input, escape = true) => {
  // Most common case: string (~50% of nodes)
  if (typeof input === "string") {
    return escape ? escapeHTML(input) : input
  }

  // Second most common: arrays (~20% of nodes)
  if (Array.isArray(input)) {
    let result = ""
    for (let i = 0, ilen = input.length; i < ilen; i++) {
      result += render(input[i], escape)
    }
    return result
  }

  // Early exit for null/undefined/false/true
  if (
    input === null ||
    input === undefined ||
    input === false ||
    input === true
  ) {
    return ""
  }

  // Objects (elements) - check ignore flag first
  if (input.ignore) {
    return ""
  }

  if (input.name === "raw") {
    return render(input.children, false)
  }

  if (SELF_CLOSING_TAGS.has(input.name)) {
    const attrs = input.attributes ? attributes(input.attributes) : ""
    return attrs ? `<${input.name} ${attrs}>` : `<${input.name}>`
  }

  if (input.name) {
    const attrs = input.attributes ? attributes(input.attributes) : ""
    const children = render(input.children, !UNESCAPED_TAGS.has(input.name))

    return attrs
      ? `<${input.name} ${attrs}>${children}</${input.name}>`
      : `<${input.name}>${children}</${input.name}>`
  }

  if (typeof input === "number") {
    return input.toString()
  }

  if (typeof input === "object" && input instanceof Date) {
    return input.toString()
  }

  return ""
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
    throw new RawError(`unsupported raw type "${type}" for path "${path}"`)
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
  const children = typeof c === "number" ? c : c || []
  return {
    name,
    children,
    attributes,
  }
}

function decamelize(string) {
  return string.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
}

function stylesheet(input) {
  const object = { ...input }
  function render(object, selector = "") {
    let result = []
    for (const key in object) {
      const value = object[key]
      if (value && typeof value === "object") {
        if (key.startsWith("@")) {
          result.push(`${key}{${render(value, selector)}}`)
        } else {
          const nextSelector = selector ? `${selector} ${key}` : key
          result.push(render(value, nextSelector))
        }
      } else {
        if (selector) {
          result.push(`${selector}{${decamelize(key)}:${value};}`)
        } else {
          result.push(`${decamelize(key)}:${value};`)
        }
      }
    }
    return result.join("")
  }
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
      return render(object)
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
  const tree = csstree.parse(result)
  const classes = {}

  csstree.walk(tree, (node) => {
    if (node.type === "ClassSelector") {
      const hash = createHash(result + node.name)
      const name = hash
      classes[node.name] = name
      node.name = name
    }
  })

  return {
    ...classes,
    css: tag("style", csstree.generate(tree)),
  }
}

function occurrences(input, string) {
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
  const count1 = occurrences(content, character1)
  const count2 = occurrences(content, character2)
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
    throw new CSSError(`invalid CSS for path "${file}": ${message}`)
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
const Doctype = node("!DOCTYPE html")

const nodes = [
  "a",
  "abbr",
  "address",
  "animate",
  "animateMotion",
  "animateTransform",
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
  "circle",
  "cite",
  "clipPath",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "defs",
  "del",
  "desc",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "ellipse",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "filter",
  "footer",
  "foreignObject",
  "form",
  "g",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "image",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "line",
  "linearGradient",
  "link",
  "main",
  "map",
  "mark",
  "marker",
  "mask",
  "menu",
  "meta",
  "metadata",
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
  "path",
  "pattern",
  "picture",
  "polygon",
  "polyline",
  "pre",
  "progress",
  "q",
  "radialGradient",
  "rect",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "set",
  "slot",
  "small",
  "source",
  "span",
  "stop",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "svg",
  "switch",
  "symbol",
  "table",
  "tbody",
  "td",
  "template",
  "text",
  "textarea",
  "textPath",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "tspan",
  "u",
  "ul",
  "use",
  "var",
  "video",
  "view",
  "wbr",
].reduce((result, name) => {
  const pascalName = name.charAt(0).toUpperCase() + name.slice(1)
  result[pascalName] = node(name)
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

nodes.Img.load = function (path) {
  const type = extension(path)
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(type)) {
    throw new ImageError(`unsupported image type "${type}" for path "${path}"`)
  }
  const content = readFile(path, "base64")
  return (options) => {
    return nodes.Img({ src: base64({ content, path }), ...options })
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

nodes.Svg.load = function (path, options = {}) {
  const type = extension(path)
  if (type !== "svg") {
    throw new SVGError(`unsupported SVG type "${type}" for path "${path}"`)
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
      throw new JSONError(`cannot parse file "${file}": ${exception.message}`)
    }
  },
}

function i18n(translations) {
  return function translate(language, key) {
    if (key === undefined) {
      throw new TranslationError("key is undefined")
    }
    if (language === undefined) {
      throw new TranslationError("language is undefined")
    }
    if (translations[key] === undefined) {
      throw new TranslationError(
        `translation [${key}][${language}] is undefined`,
      )
    }
    if (translations[key][language] === undefined) {
      throw new TranslationError(
        `translation [${key}][${language}] is undefined`,
      )
    }
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
      throw new TranslationError(`language is undefined`)
    }
    if (!key) {
      throw new TranslationError(`key is undefined`)
    }
    if (!data[key] || !data[key][language]) {
      throw new TranslationError(
        `translation [${key}][${language}] is undefined`,
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
        throw new TranslationError(
          `language is undefined for component:\n${fn.toString()}`,
        )
      }
      const { language } = a
      function translate(key) {
        if (!key) {
          throw new TranslationError(
            `key is undefined for component:\n${fn.toString()}`,
          )
        }
        if (!i18n[key] || !i18n[key][language]) {
          throw new TranslationError(
            `translation [${key}][${language}] is undefined for component:\n${fn.toString()}`,
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
  Doctype,
  escape: escapeHTML,
  raw,
  css,
  js,
  json,
  tag,
  i18n,
  TranslationError,
  FileError,
  RawError,
  CSSError,
  ImageError,
  SVGError,
  JSONError,
  ...nodes,
}
