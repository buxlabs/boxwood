const test = require("node:test")
const assert = require("node:assert")
const { JSDOM } = require("jsdom")
const { compile } = require("../../..")
const { runBundleAgain } = require("../helpers")
const { parseInlineScript } = require("../../scripts/helpers")

async function render() {
  const { template } = await compile(__dirname)
  // runScripts: "dangerously" executes the embedded <script> as the doc parses.
  const dom = new JSDOM(template(), { runScripts: "dangerously" })
  const { document } = dom.window

  const form = document.querySelector("form")
  const email = document.querySelector("#email")
  const password = document.querySelector("#password")
  const submit = document.querySelector("button[type=submit]")
  const error = form.querySelector("p")
  const status = document.querySelector("body > p")

  // The generated class names are not the point - asking the cascade whether
  // the element ends up displayed is, and jsdom resolves the inlined stylesheet.
  const visible = (element) =>
    dom.window.getComputedStyle(element).display !== "none"

  function type(input, value) {
    input.value = value
    input.dispatchEvent(new dom.window.Event("input", { bubbles: true }))
  }

  // dispatchEvent returns false when a listener called preventDefault
  function send() {
    return !form.dispatchEvent(
      new dom.window.Event("submit", { bubbles: true, cancelable: true }),
    )
  }

  return {
    dom,
    document,
    form,
    email,
    password,
    submit,
    error,
    status,
    type,
    send,
    visible,
  }
}

test("#reactivity/login-form: it renders the form with scoped styles", async () => {
  const { template } = await compile(__dirname)
  const html = template()

  assert(html.includes('<form class="c1" data-form="" novalidate>'))
  assert(
    html.includes('<input id="email" name="email" type="email" class="c2">'),
  )
  assert(
    html.includes(
      '<input id="password" name="password" type="password" class="c2">',
    ),
  )
  assert(
    html.includes(
      '<button type="submit" class="c3" data-submit="" disabled>Sign in</button>',
    ),
  )
  assert(html.includes("<style>"))
  // The hidden state is an attribute now, so the rule hangs off the class.
  assert(html.includes(".c4[data-hidden]{display:none}"))
})

test("#reactivity/login-form: it emits a single, parseable bundle", async () => {
  const { template } = await compile(__dirname)

  // Throws when the page carries more than one inline script, or when the
  // emitted bundle is not valid JavaScript.
  const tree = parseInlineScript(template())
  assert(tree.body.length > 0)
})

test("#reactivity/login-form: the submit button follows both inputs", async () => {
  const { email, password, submit, type } = await render()

  assert.strictEqual(submit.disabled, true)

  type(email, "user@example.com")
  assert.strictEqual(submit.disabled, true) // password is still empty

  type(password, "secret")
  assert.strictEqual(submit.disabled, false)

  type(password, "   ")
  assert.strictEqual(submit.disabled, true) // whitespace does not count

  type(password, "secret")
  assert.strictEqual(submit.disabled, false)
})

test("#reactivity/login-form: an invalid email shows the error and blocks the status", async () => {
  const { email, password, error, status, type, send, visible } = await render()

  assert.strictEqual(visible(error), false)

  type(email, "not-an-email")
  type(password, "secret")

  assert.strictEqual(send(), true) // the default submit was prevented
  assert.strictEqual(visible(error), true)
  assert.strictEqual(error.textContent, "Enter a valid email address")
  assert.strictEqual(status.textContent, "")
})

test("#reactivity/login-form: editing an input clears the error", async () => {
  const { email, password, error, type, send, visible } = await render()

  type(email, "not-an-email")
  type(password, "secret")
  send()
  assert.strictEqual(visible(error), true)

  type(email, "user@example.com")
  assert.strictEqual(visible(error), false)
  assert.strictEqual(error.textContent, "")
})

test("#reactivity/login-form: a valid submit interpolates the email into the status", async () => {
  const { email, password, error, status, type, send, visible } = await render()

  type(email, "user@example.com")
  type(password, "secret")

  assert.strictEqual(send(), true) // the default submit was prevented
  assert.strictEqual(status.textContent, "Signed in as user@example.com")
  assert.strictEqual(visible(error), false)
})

test("#reactivity/login-form: running the bundle twice does not stack listeners", async () => {
  const { dom, email, password, status, error, type, send, visible } =
    await render()

  // A second run must not register a single new listener.
  assert.strictEqual(runBundleAgain(dom), 0)

  type(email, "user@example.com")
  type(password, "secret")

  assert.strictEqual(send(), true)
  assert.strictEqual(status.textContent, "Signed in as user@example.com")
  assert.strictEqual(visible(error), false)
})
