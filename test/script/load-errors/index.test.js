const test = require("node:test")
const assert = require("node:assert")
const { mkdtempSync, writeFileSync, rmSync } = require("fs")
const { join } = require("path")
const { tmpdir } = require("os")
const { js, FileError, ScriptError } = require("../../..")

/*
 * What js.load says when it cannot read something. These are the errors an
 * author sees while wiring a component up, so they have to name the thing
 * that is actually wrong.
 */

test("#script/load-errors: a file outside the project says so", () => {
  const directory = mkdtempSync(join(tmpdir(), "boxwood-"))
  const path = join(directory, "client.js")
  writeFileSync(path, "window.x = 1")

  try {
    // The symlink walk slices the working directory off the front of the path,
    // which only means anything once the path is known to start with it. Run
    // in the other order, this reported a missing file inside the project -
    // a path the author never wrote and which never existed.
    assert.throws(() => js.load(path), FileError)
    assert.throws(
      () => js.load(path),
      /is not within the current working directory/,
    )
    assert.doesNotThrow(() => {
      try {
        js.load(path)
      } catch (error) {
        assert(!/ENOENT/.test(error.message))
      }
    })
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test("#script/load-errors: an unsupported extension names the type", () => {
  // "app.mjs" is a file, not a directory to look for an index.js inside. It
  // used to be joined into "app.mjs/index.js" and reported as a missing
  // directory, which says nothing about the real problem.
  assert.throws(
    () => js.load(join(__dirname, "client.mjs")),
    /unsupported file type "mjs"/,
  )
})

test("#script/load-errors: a directory still resolves to its index.js", () => {
  // The name has no dot in it, so it is a directory - that behaviour stays.
  assert.doesNotThrow(() => js.load(join(__dirname, "../load-target")))
})

test("#script/load-errors: an unrecognised target is refused", () => {
  const client = join(__dirname, "client.js")

  // A typo used to land the script in the body without a word, which is a
  // silent answer to a question the author asked explicitly.
  assert.throws(() => js.load(client, { target: "heading" }), ScriptError)
  assert.throws(
    () => js.load(client, { target: "HEAD" }),
    /not a script target/,
  )
})

test("#script/load-errors: head and body are both spellable", () => {
  const client = join(__dirname, "client.js")

  assert.strictEqual(
    js.load(client, { target: "head" }).js.attributes.target,
    "head",
  )
  assert.strictEqual(
    js.load(client, { target: "body" }).js.attributes.target,
    "body",
  )
  // Leaving it out means the body, which is why there is no js.body.
  assert.deepStrictEqual(js.load(client).js.attributes, {})
})
