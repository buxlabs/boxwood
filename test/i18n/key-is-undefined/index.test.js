const test = require("node:test")
const assert = require("node:assert")
const { compile, TranslationError } = require("../../..")

test("i18n is going to throw when key is undefined", async () => {
  const { template } = await compile(__dirname)
  let error
  try {
    template({ language: "en" })
  } catch (exception) {
    error = exception
  }
  assert(error instanceof TranslationError)
  assert(error.message.includes("key is undefined"))
})
