const test = require("node:test")
const assert = require("node:assert")
const { js, css, ScriptError, CSSError } = require("../..")

const source = (result) => result.js.children
const stylesheet = (result) => result.css.children

/*
 * A placeholder becomes text in the output, so every value that can be written
 * down must survive and everything else must say so.
 *
 * The check used to be `if (value)`, which deleted all six falsy values without
 * a word: js`let n = ${0}` emitted "let n = " and failed to parse, while
 * js`window.on = ${false}` emitted "window.on = " - and in a position where the
 * hole still parsed, nothing was raised at all.
 */

test("#interpolation: zero is written, not dropped", () => {
  assert.strictEqual(source(js`let n = ${0}`), "let n = 0")
})

test("#interpolation: false is written, not dropped", () => {
  assert.strictEqual(source(js`window.on = ${false}`), "window.on = false")
})

test("#interpolation: an empty string is written, not dropped", () => {
  assert.strictEqual(source(js`window.s = "${""}"`), 'window.s = ""')
})

test("#interpolation: strings and numbers still interpolate", () => {
  assert.strictEqual(source(js`window.n = ${5}`), "window.n = 5")
  assert.strictEqual(source(js`window.q = ".${"c1"}"`), 'window.q = ".c1"')
})

test("#interpolation: undefined is refused, and the message says why", () => {
  // The common way to land here: a scoped class whose stylesheet has no rule
  // for it. It used to leave the selector as "." and match nothing.
  assert.throws(() => js`window.q = ".${undefined}"`, ScriptError)
  assert.throws(
    () => js`window.q = ".${undefined}"`,
    /placeholder 1 is undefined/,
  )
  assert.throws(() => js`window.q = ".${undefined}"`, /stylesheet has no rule/)
})

test("#interpolation: null is refused", () => {
  assert.throws(() => js`window.q = ${null}`, /placeholder 1 is null/)
})

test("#interpolation: an object is refused", () => {
  // It used to interpolate as the string "[object Object]".
  assert.throws(() => js`window.o = ${{ a: 1 }}`, /placeholder 1 is an object/)
})

test("#interpolation: an array is refused", () => {
  // The worst of them: `${[1, 2]}` produced "1,2", which parses as a sequence
  // expression and quietly evaluates to 2.
  assert.throws(() => js`window.a = ${[1, 2]}`, /placeholder 1 is an array/)
})

test("#interpolation: the position of the bad placeholder is named", () => {
  assert.throws(
    () => js`window.a = ${1}; window.b = ${undefined}`,
    /placeholder 2 is undefined/,
  )
})

test("#interpolation: css has the same rules", () => {
  assert.strictEqual(
    stylesheet(css`
      .a {
        opacity: ${0};
      }
    `),
    // The class name is hashed by the scoping, the value is not.
    ".c1{opacity:0}",
  )
  assert.throws(
    () => css`
      .a {
        color: ${undefined};
      }
    `,
    CSSError,
  )
  assert.throws(
    () => css`
      .a {
        color: ${undefined};
      }
    `,
    /placeholder 1 is undefined/,
  )
})
