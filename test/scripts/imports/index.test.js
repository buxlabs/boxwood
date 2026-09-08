const test = require("node:test")
const assert = require("node:assert")
const { join, relative } = require("path")
const { mkdtempSync, writeFileSync, rmSync } = require("fs")
const { tmpdir } = require("os")
const { JSDOM } = require("jsdom")
const { compile, js, ScriptError, FileError } = require("../../..")

const invalid = (name) => join(__dirname, "invalid", name)

async function render() {
  const { template } = await compile(__dirname)
  return new JSDOM(template({}), { runScripts: "dangerously" })
}

test("#scripts/imports: a helper is inlined where it is used", async () => {
  const { window } = await render()

  assert.strictEqual(
    window.document.querySelector("[data-greeting]").textContent,
    "Hello there",
  )
})

test("#scripts/imports: an unused export is not shipped", async () => {
  const { template } = await compile(__dirname)

  // utilities/string.js exports two functions and only one is reached.
  assert(!template({}).includes("unused"))
  assert(!template({}).includes("toLowerCase"))
})

test("#scripts/imports: nothing an entry imported becomes a global", async () => {
  const { window } = await render()

  for (const name of ["capitalize", "label"]) {
    assert.strictEqual(name in window, false, `${name} leaked`)
  }
})

test("#scripts/imports: two components may import their own same-named helper", async () => {
  const { window } = await render()
  const { document } = window

  // Each is wrapped, so one component's capitalize cannot reach the other.
  assert.strictEqual(
    document.querySelector("[data-greeting]").textContent,
    "Hello there",
  )
  assert.strictEqual(
    document.querySelector("[data-rival]").textContent,
    "OTHER:rival",
  )
})

test("#scripts/imports: a bare specifier is refused", () => {
  assert.throws(() => js.load(invalid("bare.js")), ScriptError)
  assert.throws(() => js.load(invalid("bare.js")), /is not a relative path/)
  // The message has to say where third party code does belong.
  assert.throws(() => js.load(invalid("bare.js")), /<script src=/)
})

test("#scripts/imports: a missing file names the specifier and the importer", () => {
  assert.throws(() => js.load(invalid("missing.js")), /Cannot resolve/)
  assert.throws(() => js.load(invalid("missing.js")), /\.\/nowhere\.js/)
})

test("#scripts/imports: a cycle is refused, with the chain", () => {
  assert.throws(() => js.load(invalid("cycle-a.js")), /Circular dependency/)
  assert.throws(
    () => js.load(invalid("cycle-a.js")),
    /cycle-a\.js -> .*cycle-b\.js/,
  )
})

test("#scripts/imports: an import may not escape the working directory", () => {
  // A file that really exists, outside the project. Every file the graph
  // reaches is read through the same reader as everything else, so the
  // containment rule holds for imports too and says so in the usual words.
  const outside = mkdtempSync(join(tmpdir(), "boxwood-"))
  const helper = join(outside, "helper.js")
  writeFileSync(helper, "export function x () { return 1 }")

  const entry = join(__dirname, "invalid", "escaping.js")
  writeFileSync(
    entry,
    `import { x } from "${relative(join(__dirname, "invalid"), helper)}"\nwindow.y = x()\n`,
  )

  try {
    assert.throws(() => js.load(entry), FileError)
    assert.throws(
      () => js.load(entry),
      /is not within the current working directory/,
    )
  } finally {
    rmSync(outside, { recursive: true, force: true })
    rmSync(entry, { force: true })
  }
})
